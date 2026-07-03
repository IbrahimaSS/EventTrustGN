const Event = require('../models/Event');
const Institution = require('../models/Institution');

// @desc    Recherche globale publique
// @route   GET /api/search?q=
// @access  Public
const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json({ events: [], institutions: [] });
    }

    // Recherche d'événements publics
    const events = await Event.find({ 
      status: 'published',
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } }
      ]
    })
    .populate('institutionId', 'name')
    .limit(10);

    // Recherche d'institutions actives
    const institutions = await Institution.find({
      status: 'active',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { acronym: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);

    res.json({ events, institutions });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = { globalSearch };
