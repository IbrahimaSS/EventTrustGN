const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['Super Admin', 'Admin Institution', 'Responsable Communication', 'Gestionnaire d\'Inscriptions', 'Agent de Contrôle', 'Participant'],
    default: 'Participant'
  },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', default: null },
  academicInstitution: { type: String, default: null },
  studyLevel: { type: String, default: null },
  city: { type: String, default: null },
  isPhoneVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  avatar: { type: String, default: null },
  lastLoginAt: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
