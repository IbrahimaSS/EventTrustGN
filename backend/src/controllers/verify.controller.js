const Registration = require('../models/Registration');
const Badge = require('../models/Badge');
const Event = require('../models/Event');

// @desc    Vérifier un code (Event, Badge, Registration)
// @route   GET /api/verify/:code
// @access  Public
const verifyCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({ valid: false, message: "Code requis." });
    }

    const upperCode = code.toUpperCase().trim();

    if (upperCode.startsWith('EVT')) {
      const event = await Event.findOne({ publicationCode: upperCode }).populate('institutionId', 'name');
      if (event) {
        return res.json({
          valid: true,
          type: 'event',
          data: {
            title: event.title,
            institution: event.institutionId?.name || 'Inconnu',
            date: new Date(event.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
            location: event.location || event.city,
            status: event.status === 'published' ? 'Officiel et publié' : 'Statut: ' + event.status
          }
        });
      }
    } else if (upperCode.startsWith('BDG')) {
      const badge = await Badge.findOne({ badgeNumber: upperCode })
        .populate('eventId', 'title')
        .populate('participantId', 'fullName avatar')
        .populate('institutionId', 'name');
      if (badge) {
        return res.json({
          valid: true,
          type: 'badge',
          data: {
            participantName: badge.participantId?.fullName || 'Inconnu',
            participantAvatar: badge.participantId?.avatar || null,
            eventName: badge.eventId?.title || 'Événement',
            institution: badge.institutionId?.name || 'Institution',
            status: badge.status === 'active' ? 'Valide' : 'Invalide / Utilisé'
          }
        });
      }
    } else if (upperCode.startsWith('REG')) {
      const reg = await Registration.findOne({ registrationNumber: upperCode })
        .populate('participantId', 'fullName avatar')
        .populate({
          path: 'eventId',
          select: 'title location startDate institutionId',
          populate: { path: 'institutionId', select: 'name' }
        });
      if (reg) {
        return res.json({
          valid: true,
          type: 'registration',
          data: {
            participantName: reg.participantId?.fullName || 'Inconnu',
            participantAvatar: reg.participantId?.avatar || null,
            eventName: reg.eventId?.title || 'Événement',
            institution: reg.eventId?.institutionId?.name || 'Institution',
            date: reg.eventId?.startDate ? new Date(reg.eventId.startDate).toLocaleDateString('fr-FR') : '',
            status: reg.status === 'accepted' ? 'Confirmé' : (reg.status === 'pending' ? 'En attente' : 'Annulé / Refusé')
          }
        });
      }
    }

    // Fallback if not found
    return res.status(404).json({
      valid: false,
      message: "Ce code est introuvable ou a été falsifié. Aucun document correspondant dans notre registre."
    });

  } catch (error) {
    console.error("Erreur de vérification:", error);
    res.status(500).json({ valid: false, message: "Erreur serveur.", error: error.message });
  }
};

module.exports = { verifyCode };
