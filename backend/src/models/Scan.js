const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scanResult: {
    type: String,
    enum: ['valid', 'already_used', 'cancelled', 'invalid', 'wrong_event'],
    required: true
  },
  message: { type: String },
  scannedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Scan', scanSchema);
