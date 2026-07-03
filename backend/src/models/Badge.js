const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badgeCode: { type: String, required: true, unique: true },
  qrCodeData: { type: String, required: true },
  status: {
    type: String,
    enum: ['valid', 'used', 'cancelled'],
    default: 'valid'
  },
  usedAt: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('Badge', badgeSchema);
