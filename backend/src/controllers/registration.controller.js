const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const Badge = require('../models/Badge');
const ScanLog = require('../models/ScanLog');
const { generateUniqueCode } = require('../utils/generateCode');
const { generateEventQRCode } = require('../services/qrcode.service');

// @desc    S'inscrire à un événement
// @route   POST /api/events/:id/register
// @access  Private (Participant)
const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const participantId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ message: "Les inscriptions ne sont pas ouvertes pour cet événement." });
    }

    // Vérifier la limite de places
    if (event.maxParticipants > 0) {
      const currentRegistrations = await Registration.countDocuments({ eventId, status: { $in: ['accepted', 'pending'] } });
      if (currentRegistrations >= event.maxParticipants) {
        return res.status(400).json({ message: "L'événement est complet." });
      }
    }

    // Vérifier si l'utilisateur est déjà inscrit (géré aussi par l'index MongoDB)
    const existingRegistration = await Registration.findOne({ eventId, participantId });
    if (existingRegistration) {
      return res.status(400).json({ message: "Vous êtes déjà inscrit à cet événement." });
    }

    const registrationNumber = generateUniqueCode('REG');
    let paymentStatus = 'not_required';
    
    if (event.paymentRequired) {
      paymentStatus = 'pending';
    }

    const registration = await Registration.create({
      eventId,
      participantId,
      registrationNumber,
      status: 'pending',
      paymentStatus,
      submittedData: req.body?.submittedData || {}
    });

    res.status(201).json({ 
      message: "Inscription enregistrée avec succès.", 
      registration 
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Vous êtes déjà inscrit à cet événement." });
    }
    console.error("Erreur Inscription:", error);
    res.status(500).json({ message: "Erreur lors de l'inscription.", error: error.message, stack: error.stack });
  }
};

// @desc    Voir ses inscriptions
// @route   GET /api/registrations/me
// @access  Private
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ participantId: req.user._id })
                                            .populate('eventId', 'title startDate location status qrCodeData')
                                            .sort('-registeredAt');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Accepter ou refuser une inscription (Gestionnaire d'Inscriptions)
// @route   PATCH /api/registrations/:id/status
// @access  Private (Gestionnaire d'Inscriptions, Admin Institution)
const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' ou 'rejected'
    const registration = await Registration.findById(req.params.id).populate('eventId');

    if (!registration) {
      return res.status(404).json({ message: "Inscription non trouvée." });
    }

    // Sécurité : Vérifier que le gestionnaire appartient à la même institution que l'événement
    if (registration.eventId.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({ message: "Non autorisé." });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Statut invalide." });
    }

    registration.status = status;
    registration.validatedBy = req.user._id;
    registration.validatedAt = Date.now();
    await registration.save();

    let generatedBadge = null;
    if (status === 'accepted') {
      const existingBadge = await Badge.findOne({ registrationId: registration._id });
      if (!existingBadge) {
        const badgeCode = generateUniqueCode('BDG');
        const qrCodeData = await generateEventQRCode(badgeCode);
        generatedBadge = await Badge.create({
          eventId: registration.eventId._id,
          registrationId: registration._id,
          participantId: registration.participantId,
          badgeCode,
          qrCodeData
        });
      }
    }

    res.json({ message: `Inscription mise à jour : ${status}`, registration, badge: generatedBadge });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Lister les inscriptions pour une institution
// @route   GET /api/registrations/institution
// @access  Private (Admin Institution, Gestionnaire d'Inscriptions)
const getInstitutionRegistrations = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    
    // Trouver tous les événements de l'institution
    const events = await Event.find({ institutionId }).select('_id');
    const eventIds = events.map(e => e._id);

    // Trouver toutes les inscriptions pour ces événements
    const registrations = await Registration.find({ eventId: { $in: eventIds } })
      .populate('eventId', 'title')
      .populate('participantId', 'fullName email phone avatar')
      .sort('-registeredAt');

    const formattedRegistrations = registrations.map(reg => {
      if (!reg.participantId) return reg;
      const names = reg.participantId.fullName ? reg.participantId.fullName.split(' ') : [];
      const participantId = {
        ...reg.participantId.toObject(),
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        phoneNumber: reg.participantId.phone || ''
      };
      return { ...reg.toObject(), participantId };
    });

    res.json(formattedRegistrations);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Lister les participants uniques d'une institution
// @route   GET /api/registrations/institution/participants
// @access  Private (Admin Institution, Gestionnaire d'Inscriptions)
const getInstitutionParticipants = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;
    
    const events = await Event.find({ institutionId }).select('_id');
    const eventIds = events.map(e => e._id);

    const registrations = await Registration.find({ eventId: { $in: eventIds }, status: { $in: ['accepted', 'pending'] } })
      .populate('participantId', 'fullName email phone createdAt avatar');

    const participantsMap = {};

    registrations.forEach(reg => {
      if (!reg.participantId) return; // Si utilisateur supprimé
      const pId = reg.participantId._id.toString();
      
      const names = reg.participantId.fullName ? reg.participantId.fullName.split(' ') : [];
      if (!participantsMap[pId]) {
        participantsMap[pId] = {
          _id: pId,
          firstName: names[0] || '',
          lastName: names.slice(1).join(' ') || '',
          email: reg.participantId.email,
          phoneNumber: reg.participantId.phone,
          avatar: reg.participantId.avatar,
          joinDate: reg.participantId.createdAt,
          eventsCount: 0,
          lastActive: reg.registeredAt
        };
      }
      
      participantsMap[pId].eventsCount += 1;
      
      if (new Date(reg.registeredAt) > new Date(participantsMap[pId].lastActive)) {
        participantsMap[pId].lastActive = reg.registeredAt;
      }
    });

    const participants = Object.values(participantsMap).map(p => {
      return {
        ...p,
        status: p.eventsCount >= 2 ? 'vip' : 'active'
      }
    });

    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Importer des inscriptions en masse
// @route   POST /api/registrations/institution/bulk
// @access  Private (Admin Institution, Gestionnaire d'Inscriptions)
const bulkRegister = async (req, res) => {
  try {
    const { eventId, participants } = req.body;
    const institutionId = req.user.institutionId;

    if (!eventId || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ message: "Données invalides." });
    }

    const event = await Event.findOne({ _id: eventId, institutionId });
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé ou accès refusé." });
    }

    const results = { added: 0, existed: 0, errors: 0 };

    for (const p of participants) {
      if (!p.email) continue;
      
      try {
        let user = await User.findOne({ email: p.email });
        if (!user) {
          const randomPassword = Math.random().toString(36).slice(-8);
          user = await User.create({
            firstName: p.firstName || 'Inconnu',
            lastName: p.lastName || 'Inconnu',
            email: p.email,
            phoneNumber: p.phoneNumber || '',
            password: randomPassword,
            role: 'Participant'
          });
        }

        const existingReg = await Registration.findOne({ eventId, participantId: user._id });
        if (existingReg) {
          results.existed++;
          continue;
        }

        const registrationNumber = generateUniqueCode('REG');
        const reg = await Registration.create({
          eventId,
          participantId: user._id,
          registrationNumber,
          status: 'accepted',
          paymentStatus: event.paymentRequired ? 'paid' : 'not_required'
        });
        
        const badgeCode = generateUniqueCode('BDG');
        const qrCodeData = await generateEventQRCode(badgeCode);
        await Badge.create({
          eventId,
          registrationId: reg._id,
          participantId: user._id,
          badgeCode,
          qrCodeData
        });
        
        // Mettre à jour le nombre de participants sur l'événement
        await Event.findByIdAndUpdate(eventId, { $inc: { participants: 1 } });
        
        results.added++;
      } catch (err) {
        results.errors++;
      }
    }

    res.json({ message: "Import terminé.", results });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Scanner un badge
// @route   POST /api/registrations/scan
// @access  Private (Admin Institution, Agent de Scan)
const scanBadge = async (req, res) => {
  try {
    const { badgeCode, eventId } = req.body;
    const agent = req.user;
    const institutionId = agent.institutionId;

    if (!badgeCode || !eventId) {
      return res.status(400).json({ message: "Badge et Événement requis." });
    }

    // Récupérer la registration
    let registration = await Registration.findOne({ registrationNumber: badgeCode }).populate('participantId');
    
    // Si non trouvé par numéro d'inscription, chercher par code de badge
    if (!registration && badgeCode.startsWith('BDG-')) {
      const badge = await Badge.findOne({ badgeCode }).populate('registrationId');
      if (badge && badge.registrationId) {
        registration = await Registration.findById(badge.registrationId._id).populate('participantId');
      }
    }
    
    let result = 'invalid';
    let message = 'Code QR non reconnu dans le système';
    let participantId = null;

    if (registration) {
      participantId = registration.participantId._id;
      if (registration.eventId.toString() !== eventId) {
        result = 'wrong_event';
        message = 'Badge valide mais pour un autre événement';
      } else if (registration.status === 'cancelled' || registration.status === 'rejected') {
        result = 'cancelled';
        message = 'Badge annulé ou rejeté par l\'organisateur';
      } else if (registration.presence) {
        result = 'already_used';
        message = `Badge déjà scanné à ${new Date(registration.scannedAt).toLocaleTimeString('fr-FR')}`;
      } else if (registration.status === 'accepted') {
        result = 'valid';
        message = 'Accès autorisé';
        
        // Mettre à jour la présence
        registration.presence = true;
        registration.scannedAt = new Date();
        await registration.save();

        // Mettre à jour le badge associé
        await Badge.findOneAndUpdate(
          { registrationId: registration._id },
          { status: 'used', usedAt: new Date() }
        );
      }
    }

    // Log the scan
    const scanLog = await ScanLog.create({
      badgeCode,
      eventId: registration ? registration.eventId : eventId,
      participantId,
      agentId: agent._id,
      institutionId,
      result,
      message
    });

    const populatedLog = await ScanLog.findById(scanLog._id)
      .populate('participantId', 'fullName email avatar')
      .populate('eventId', 'title')
      .populate('agentId', 'fullName')
      .lean();

    let participantIdObj = null;
    if (populatedLog.participantId) {
      const names = populatedLog.participantId.fullName ? populatedLog.participantId.fullName.split(' ') : [];
      participantIdObj = {
        ...populatedLog.participantId,
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || ''
      };
    }

    let agentIdObj = null;
    if (populatedLog.agentId) {
      const agentNames = populatedLog.agentId.fullName ? populatedLog.agentId.fullName.split(' ') : [];
      agentIdObj = {
        ...populatedLog.agentId,
        firstName: agentNames[0] || '',
        lastName: agentNames.slice(1).join(' ') || ''
      };
    }

    res.json({ ...populatedLog, participantId: participantIdObj, agentId: agentIdObj });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Récupérer les logs de scan de l'institution
// @route   GET /api/registrations/institution/scans
// @access  Private (Admin Institution)
const getScanLogs = async (req, res) => {
  try {
    const logs = await ScanLog.find({ institutionId: req.user.institutionId })
      .populate('participantId', 'fullName email avatar')
      .populate('eventId', 'title')
      .populate('agentId', 'fullName')
      .sort({ createdAt: -1 })
      .lean();
    
    // Map fullName to firstName and lastName for the frontend
    const mappedLogs = logs.map(log => {
      let participantId = null;
      if (log.participantId) {
        const names = log.participantId.fullName ? log.participantId.fullName.split(' ') : [];
        participantId = {
          ...log.participantId,
          firstName: names[0] || '',
          lastName: names.slice(1).join(' ') || ''
        };
      }
      
      let agentId = null;
      if (log.agentId) {
        const agentNames = log.agentId.fullName ? log.agentId.fullName.split(' ') : [];
        agentId = {
          ...log.agentId,
          firstName: agentNames[0] || '',
          lastName: agentNames.slice(1).join(' ') || ''
        };
      }
      
      return { ...log, participantId, agentId };
    });

    res.json(mappedLogs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Récupérer les analytiques de l'institution
// @route   GET /api/registrations/institution/analytics
// @access  Private (Admin Institution)
const getInstitutionAnalytics = async (req, res) => {
  try {
    const institutionId = req.user.institutionId;

    // 1. Événements
    const events = await Event.find({ institutionId });
    const totalEvents = events.length;
    const publishedEvents = events.filter(e => e.status === 'published').length;

    // 2. Inscriptions
    const eventIds = events.map(e => e._id);
    const registrations = await Registration.find({ eventId: { $in: eventIds } });
    const totalRegistrations = registrations.length;
    const acceptedRegistrations = registrations.filter(r => r.status === 'accepted').length;

    // 3. Badges (accepted registrations = badges générés)
    const totalBadges = acceptedRegistrations;

    // 4. Présence
    const totalPresent = registrations.filter(r => r.presence === true).length;
    const presenceRate = acceptedRegistrations > 0 ? Math.round((totalPresent / acceptedRegistrations) * 100) : 0;

    // 5. Inscriptions par mois (12 derniers mois)
    const monthlyData = [];
    const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const count = registrations.filter(r => {
        const rd = new Date(r.registeredAt);
        return rd >= d && rd < nextMonth;
      }).length;
      monthlyData.push({ label: monthLabels[d.getMonth()], value: count });
    }

    // 6. Résultats des scans
    const scanLogs = await ScanLog.find({ institutionId });
    const scanValid = scanLogs.filter(s => s.result === 'valid').length;
    const scanAlreadyUsed = scanLogs.filter(s => s.result === 'already_used').length;
    const scanRefused = scanLogs.filter(s => s.result !== 'valid' && s.result !== 'already_used').length;

    // 7. Top 5 événements par inscriptions
    const eventRegCounts = {};
    registrations.forEach(r => {
      const eid = r.eventId.toString();
      eventRegCounts[eid] = (eventRegCounts[eid] || 0) + 1;
    });
    const topEvents = events
      .map(e => ({
        name: e.title,
        participants: eventRegCounts[e._id.toString()] || 0,
        maxParticipants: e.maxParticipants || 0
      }))
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 5)
      .map(e => ({
        ...e,
        fill: e.maxParticipants > 0 ? Math.min(Math.round((e.participants / e.maxParticipants) * 100), 100) : 50
      }));

    // 8. Événements par catégorie (par type de registration)
    const freeEvents = events.filter(e => e.registrationType === 'free').length;
    const paidEvents = events.filter(e => e.registrationType === 'paid').length;
    const eventsByCategory = [
      { label: 'Gratuits', value: freeEvents, color: '#10b981' },
      { label: 'Payants', value: paidEvents, color: '#f59e0b' },
      { label: 'Publiés', value: publishedEvents, color: '#0d6efd' },
      { label: 'Brouillons', value: events.filter(e => e.status === 'draft').length, color: '#94a3b8' },
    ];

    res.json({
      totalEvents,
      totalRegistrations,
      totalBadges,
      presenceRate,
      monthlyRegistrations: monthlyData,
      scanResults: [
        { value: scanValid, color: '#10b981', label: 'Accès OK' },
        { value: scanAlreadyUsed, color: '#f59e0b', label: 'Déjà scanné' },
        { value: scanRefused, color: '#ef4444', label: 'Refusé' },
      ],
      topEvents,
      eventsByCategory
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = { registerForEvent, getMyRegistrations, updateRegistrationStatus, getInstitutionRegistrations, getInstitutionParticipants, bulkRegister, scanBadge, getScanLogs, getInstitutionAnalytics };
