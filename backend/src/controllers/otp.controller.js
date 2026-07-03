const { createAndSendOTP, verifyOTP } = require('../services/otp.service');
const User = require('../models/User');

// @desc    Envoyer un code OTP
// @route   POST /api/otp/send
// @access  Public ou Privé selon le 'purpose'
const sendOTP = async (req, res) => {
  try {
    const { contact, purpose } = req.body; // contact = email ou phone

    if (!contact || !purpose) {
      return res.status(400).json({ message: "Le contact et le but (purpose) sont requis." });
    }

    const sent = await createAndSendOTP(contact, purpose);
    
    if (sent) {
      res.status(200).json({ message: "Code envoyé avec succès." });
    } else {
      res.status(500).json({ message: "Erreur lors de l'envoi du code." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vérifier un code OTP
// @route   POST /api/otp/verify
// @access  Public ou Privé
const verify = async (req, res) => {
  try {
    const { contact, code, purpose } = req.body;

    if (!contact || !code || !purpose) {
      return res.status(400).json({ message: "Le contact, le code et le but sont requis." });
    }

    await verifyOTP(contact, code, purpose);

    // Si c'est pour vérifier un compte (téléphone ou email)
    if (purpose === 'account_verification') {
      const user = await User.findOne({ $or: [{ email: contact }, { phone: contact }] });
      if (user) {
        user.isPhoneVerified = true;
        await user.save();
      }
    }

    res.status(200).json({ message: "Code vérifié avec succès. Vous êtes authentifié." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { sendOTP, verify };
