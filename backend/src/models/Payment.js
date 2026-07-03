const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'GNF' },
  provider: { type: String, default: 'Lengo Pay' },
  providerReference: { type: String }, // Transaction ID venant de Lengo Pay
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled', 'expired'],
    default: 'pending'
  },
  phone: { type: String }, // Le numéro utilisé pour payer
  paymentMethod: { type: String, default: 'MOBILE_MONEY' },
  rawResponse: { type: Object }, // Réponse brute du webhook Lengo Pay pour debug
  paidAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
