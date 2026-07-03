const Notification = require('../models/Notification');

// @desc    Obtenir les notifications de l'utilisateur
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort('-createdAt')
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// @desc    Marquer une notification comme lue
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'read' },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification non trouvée." });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = { getNotifications, markAsRead };
