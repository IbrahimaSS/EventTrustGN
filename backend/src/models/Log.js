const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  action: { type: String, required: true }, // ex: 'create_event', 'publish_event', 'approve_institution'
  description: { type: String },
  oldValue: { type: Object },
  newValue: { type: Object },
  ipAddress: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Log', logSchema);
