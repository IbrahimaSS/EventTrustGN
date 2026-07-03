const Scan = require('../models/Scan');
const Event = require('../models/Event');

// @desc    Obtenir l'historique des scans pour un événement
// @route   GET /api/scans/event/:eventId
// @access  Private (Admin Institution, Agent de Contrôle)
const getEventScans = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé." });
    }

    if (event.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({ message: "Non autorisé." });
    }

    const scans = await Scan.find({ eventId: req.params.eventId })
                            .populate('agentId', 'fullName')
                            .populate({
                              path: 'badgeId',
                              populate: { path: 'participantId', select: 'fullName email' }
                            })
                            .sort('-scannedAt');
                            
    res.json(scans);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = { getEventScans };
