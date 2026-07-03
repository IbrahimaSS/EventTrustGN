const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  city: { type: String },
  location: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  startTime: { type: String },
  endTime: { type: String },
  imageUrl: { type: String },
  maxParticipants: { type: Number, default: 0 },
  registrationRequired: { type: Boolean, default: false },
  registrationType: { type: String, enum: ['free', 'paid'], default: 'free' },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'GNF' },
  paymentRequired: { type: Boolean, default: false },
  registrationDeadline: { type: Date },
  conditions: { type: String },
  requiredDocuments: [{ type: String }],
  contactInfo: { type: String },
  status: {
    type: String,
    enum: ['draft', 'published', 'postponed', 'cancelled', 'archived', 'suspended'],
    default: 'draft'
  },
  publicationCode: { type: String, unique: true, sparse: true },
  qrCodeData: { type: String },
  publishedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
