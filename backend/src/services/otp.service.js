const crypto = require('crypto');
const OTP = require('../models/OTP');
const { sendEmailOTP } = require('./email.service');

// Génère un code à 6 chiffres
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createAndSendOTP = async (phoneOrEmail, purpose) => {
  // Supprimer les anciens OTP non utilisés pour cet utilisateur et ce but
  await OTP.deleteMany({ phone: phoneOrEmail, purpose, used: false });

  const code = generateCode();
  
  // Hashage du code pour la sécurité (comme un mot de passe)
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  
  // Expiration dans 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60000);

  await OTP.create({
    phone: phoneOrEmail,
    codeHash,
    purpose,
    expiresAt
  });

  // Envoyer par email (ou SMS si on l'intègre plus tard)
  // Pour l'instant, on utilise l'email même si la variable s'appelle "phone" dans le modèle
  const sent = await sendEmailOTP(phoneOrEmail, code);
  
  return sent;
};

const verifyOTP = async (phoneOrEmail, code, purpose) => {
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  
  const otpRecord = await OTP.findOne({
    phone: phoneOrEmail,
    purpose,
    used: false
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new Error("Aucun code OTP trouvé pour cette requête.");
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new Error("Le code OTP a expiré.");
  }

  if (otpRecord.attempts >= 3) {
    throw new Error("Trop de tentatives échouées. Veuillez demander un nouveau code.");
  }

  if (otpRecord.codeHash !== codeHash) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new Error("Code OTP incorrect.");
  }

  // Le code est correct
  otpRecord.used = true;
  await otpRecord.save();
  return true;
};

module.exports = { createAndSendOTP, verifyOTP };
