const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  referenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'InstitutionReference', default: null },
  name: { type: String, required: true },
  acronym: { type: String },
  type: { type: String, required: true },
  country: { type: String, default: 'Guinée' },
  region: { type: String },
  city: { type: String, required: true },
  commune: { type: String },
  district: { type: String },
  address: { type: String },
  email: { type: String },
  phone: { type: String },
  logoUrl: { type: String },
  websiteUrl: { type: String },
  officialPageUrl: { type: String },
  description: { type: String },
  eventTrustPageSlug: { type: String, unique: true },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'rejected'],
    default: 'pending'
  },
  isVerified: { type: Boolean, default: false },
  settings: {
    theme: { type: String, default: 'Système' },
    primaryColor: { type: String, default: '#0d6efd' },
    font: { type: String, default: 'inter' },
    uiSize: { type: String, default: 'Normal' },
    language: { type: String, default: 'fr' },
    dateFormat: { type: String, default: 'eu' },
    timeFormat: { type: String, default: '24h' },
    notifications: {
      emailRegistrations: { type: Boolean, default: true },
      emailBilling: { type: Boolean, default: true },
      emailSecurity: { type: Boolean, default: true },
      emailReports: { type: Boolean, default: false },
      smsAlerts: { type: Boolean, default: true },
      smsQuota: { type: Boolean, default: true },
    }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('Institution', institutionSchema);
