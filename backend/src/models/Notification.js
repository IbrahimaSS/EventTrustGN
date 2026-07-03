const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // ex: 'inscription_accepted', 'event_published', 'badge_generated'
  title: { type: String, required: true },
  message: { type: String, required: true },
  channel: { type: String, default: 'in_app' }, // in_app, email, sms
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  },
  metadata: { type: Object } // Données supplémentaires (eventId, badgeId, etc.)
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
