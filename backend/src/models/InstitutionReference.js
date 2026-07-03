const mongoose = require('mongoose');

const institutionReferenceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  acronym: { type: String },
  type: { type: String, required: true }, // ex: 'Université', 'ONG', 'Ministère'
  country: { type: String, default: 'Guinée' },
  region: { type: String },
  city: { type: String, required: true },
  commune: { type: String },
  district: { type: String },
  address: { type: String },
  logoUrl: { type: String },
  websiteUrl: { type: String },
  officialPageUrl: { type: String },
  description: { type: String },
  source: { type: String, default: 'system' }, // system, user_submitted
  isVerifiedReference: { type: Boolean, default: false },
  eventTrustInstitutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', default: null }
}, {
  timestamps: true
});

// Index pour la recherche intelligente
institutionReferenceSchema.index({ name: 'text', acronym: 'text', city: 'text', region: 'text' });

module.exports = mongoose.model('InstitutionReference', institutionReferenceSchema);
