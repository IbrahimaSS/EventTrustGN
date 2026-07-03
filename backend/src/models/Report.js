const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Fake Event', 'Inappropriate Content', 'Spam Account', 'Payment Fraud', 'Compte Suspect', 'Other'],
    required: true
  },
  target: { type: String, required: true },
  reporter: { type: String, required: true },
  reporterType: { type: String, enum: ['user', 'ai', 'stripe', 'system'], default: 'user' },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'archived'],
    default: 'pending'
  },
  severity: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM'
  },
  description: { type: String },
  analysis: {
    riskScore: { type: Number, default: 0 },
    recommendation: { type: String }
  },
  resolvedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
