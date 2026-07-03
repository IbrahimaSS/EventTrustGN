const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registrationNumber: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  submittedData: { type: Object }, // Pour les formulaires dynamiques futurs
  paymentStatus: {
    type: String,
    enum: ['not_required', 'pending', 'paid', 'failed'],
    default: 'not_required'
  },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
  registeredAt: { type: Date, default: Date.now },
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  validatedAt: { type: Date, default: null },
  presence: { type: Boolean, default: false },
  scannedAt: { type: Date, default: null }
}, {
  timestamps: true
});

// Éviter les doubles inscriptions
registrationSchema.index({ eventId: 1, participantId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
