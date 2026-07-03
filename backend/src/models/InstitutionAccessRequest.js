const mongoose = require('mongoose');

const institutionAccessRequestSchema = new mongoose.Schema({
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', default: null },
  institutionReferenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'InstitutionReference', default: null },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  function: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedAt: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('InstitutionAccessRequest', institutionAccessRequestSchema);
