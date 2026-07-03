const mongoose = require('mongoose');

const aiRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  type: { type: String, required: true }, // ex: 'chat', 'generate_description', 'analyze', 'compose_message'
  prompt: { type: String, required: true },
  response: { type: String },
  metadata: { type: Object } // tokens consommés, modèle utilisé, etc.
}, {
  timestamps: true
});

module.exports = mongoose.model('AIRequest', aiRequestSchema);
