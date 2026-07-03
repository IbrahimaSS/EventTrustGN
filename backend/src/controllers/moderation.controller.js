const Institution = require('../models/Institution');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmailWarning } = require('../services/email.service');

// @desc    Lister toutes les données nécessitant une modération
// @route   GET /api/moderation/reports
// @access  Private (Super Admin)
const getAllReportsAdmin = async (req, res) => {
  try {
    // 1. Récupérer les institutions en attente ou signalées
    const pendingInstitutions = await Institution.find({ status: { $in: ['pending', 'suspended'] } }).lean();
    
    // 2. Récupérer les événements suspendus ou brouillons potentiellement faux
    const pendingEvents = await Event.find({ status: { $in: ['draft', 'suspended'] } }).lean();

    let reports = [];

    // Map Institutions
    pendingInstitutions.forEach(inst => {
      const diffHrs = Math.floor((Date.now() - new Date(inst.createdAt).getTime()) / 3600000);
      let dateRelative = "À l'instant";
      if(diffHrs > 0 && diffHrs < 24) dateRelative = `Il y a ${diffHrs}h`;
      else if(diffHrs >= 24) dateRelative = `Il y a ${Math.floor(diffHrs/24)}j`;

      reports.push({
        id: `INST-${inst._id}`, // Prefix pour identifier le type
        type: inst.status === 'suspended' ? 'Compte Suspect' : 'Spam Account',
        target: inst.name,
        reporter: 'System (Audit)',
        reporterType: 'ai',
        date: dateRelative,
        exactDate: new Date(inst.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: inst.status === 'suspended' ? 'archived' : 'pending',
        severity: 'HIGH',
        description: `L'institution "${inst.name}" nécessite une vérification d'authenticité.`,
      });
    });

    // Map Events
    pendingEvents.forEach(evt => {
      const diffHrs = Math.floor((Date.now() - new Date(evt.createdAt).getTime()) / 3600000);
      let dateRelative = "À l'instant";
      if(diffHrs > 0 && diffHrs < 24) dateRelative = `Il y a ${diffHrs}h`;
      else if(diffHrs >= 24) dateRelative = `Il y a ${Math.floor(diffHrs/24)}j`;

      reports.push({
        id: `EVT-${evt._id}`,
        type: 'Fake Event',
        target: evt.title,
        reporter: 'Sécurité Plateforme',
        reporterType: 'system',
        date: dateRelative,
        exactDate: new Date(evt.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: evt.status === 'suspended' ? 'archived' : 'pending',
        severity: evt.status === 'suspended' ? 'CRITICAL' : 'MEDIUM',
        description: `L'événement "${evt.title}" semble incomplet ou suspect.`,
      });
    });

    // Sort by date
    reports.sort((a, b) => {
      const timeA = new Date(a.exactDate.split(' ')[0].split('/').reverse().join('-') + 'T' + a.exactDate.split(' ')[1].replace('h', ':')).getTime();
      const timeB = new Date(b.exactDate.split(' ')[0].split('/').reverse().join('-') + 'T' + b.exactDate.split(' ')[1].replace('h', ':')).getTime();
      return timeB - timeA;
    });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Mettre à jour le statut d'un ou plusieurs signalements
// @route   PATCH /api/moderation/reports
// @access  Private (Super Admin)
const updateReportsStatus = async (req, res) => {
  try {
    const { reportIds, action, customMessage } = req.body; 
    
    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ message: "Aucun élément spécifié." });
    }

    for (const reportId of reportIds) {
      const type = reportId.split('-')[0];
      const actualId = reportId.substring(reportId.indexOf('-') + 1);

      if (type === 'INST') {
        if (action === 'resolve') await Institution.findByIdAndUpdate(actualId, { status: 'active', isVerified: true });
        if (action === 'suspend') await Institution.findByIdAndUpdate(actualId, { status: 'suspended' });
        if (action === 'delete') await Institution.findByIdAndDelete(actualId);
        if (action === 'reopen') await Institution.findByIdAndUpdate(actualId, { status: 'pending' });
        if (action === 'warn') {
          const inst = await Institution.findById(actualId);
          if (inst) {
            const user = inst.createdBy ? await User.findById(inst.createdBy) : null;
            const targetEmail = (user && user.email) ? user.email : inst.email;
            
            const msg = customMessage && customMessage.trim() !== '' 
              ? customMessage 
              : `Votre institution "${inst.name}" nécessite une revue. Veuillez vérifier vos informations sous peine de suspension.`;
            
            if (inst.createdBy) {
              await Notification.create({
                userId: inst.createdBy,
                type: 'system_warning',
                title: 'Avertissement de Modération',
                message: msg
              });
            }

            if (targetEmail) {
              console.log("Sending warning email to: ", targetEmail);
              await sendEmailWarning(targetEmail, 'Avertissement de Modération - EventTrust GN', msg);
            } else {
              console.log("Aucun email trouvé pour l'institution ", inst.name);
            }
          }
        }
      } else if (type === 'EVT') {
        if (action === 'resolve') await Event.findByIdAndUpdate(actualId, { status: 'published' });
        if (action === 'suspend') await Event.findByIdAndUpdate(actualId, { status: 'suspended' });
        if (action === 'delete') await Event.findByIdAndDelete(actualId);
        if (action === 'reopen') await Event.findByIdAndUpdate(actualId, { status: 'draft' });
        if (action === 'warn') {
          const evt = await Event.findById(actualId);
          if (evt) {
            const user = evt.createdBy ? await User.findById(evt.createdBy) : null;
            
            const msg = customMessage && customMessage.trim() !== '' 
              ? customMessage 
              : `Votre événement "${evt.title}" a été signalé. Veuillez le mettre en conformité avec nos CGU.`;
            
            if (evt.createdBy) {
              await Notification.create({
                userId: evt.createdBy,
                type: 'system_warning',
                title: 'Avertissement sur votre Événement',
                message: msg
              });
            }

            if (user && user.email) {
              console.log("Sending warning email to: ", user.email);
              await sendEmailWarning(user.email, 'Avertissement sur votre Événement - EventTrust GN', msg);
            } else {
              console.log("Aucun email trouvé pour le créateur de l'événement ", evt.title);
            }
          }
        }
      }
    }

    res.json({ message: `Modération appliquée avec succès sur les vraies données.` });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = { getAllReportsAdmin, updateReportsStatus };
