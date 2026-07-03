const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, unique: true },
  plan: { type: String, enum: ['Gratuit', 'Standard', 'Premium'], default: 'Gratuit' },
  amount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['paid', 'pending', 'failed', 'suspended'],
    default: 'paid'
  },
  method: { type: String, default: 'Gratuit' },
  autoRenew: { type: Boolean, default: false },
  nextBilling: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
