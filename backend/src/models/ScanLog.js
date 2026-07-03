const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema({
  badgeCode: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  result: {
    type: String,
    enum: ['valid', 'already_used', 'cancelled', 'invalid', 'wrong_event'],
    required: true
  },
  message: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('ScanLog', scanLogSchema);
