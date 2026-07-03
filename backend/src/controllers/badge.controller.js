const Badge = require('../models/Badge');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { generateUniqueCode } = require('../utils/generateCode');
const { generateEventQRCode } = require('../services/qrcode.service');
const { generateBadgePDF } = require('../services/pdf.service');

// @desc    Générer un badge numérique après inscription acceptée
// @route   POST /api/badges/generate/:registrationId
// @access  Private (Admin Institution, Gestionnaire d'Inscriptions)
const generateBadge = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.registrationId)
      .populate('eventId')
      .populate('participantId', 'fullName email');

    if (!registration) {
      return res.status(404).json({ message: "Inscription non trouvée." });
    }

    if (registration.status !== 'accepted') {
      return res.status(400).json({ message: "L'inscription doit être acceptée avant de générer un badge." });
    }

    // Vérifier que l'événement appartient à l'institution de l'utilisateur
    if (registration.eventId.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({ message: "Non autorisé." });
    }

    // Vérifier qu'un badge n'existe pas déjà
    const existingBadge = await Badge.findOne({ registrationId: registration._id });
    if (existingBadge) {
      return res.status(400).json({ message: "Un badge existe déjà pour cette inscription.", badge: existingBadge });
    }

    // Génération du code unique du badge
    const badgeCode = generateUniqueCode('BDG');

    // Génération du QR Code du badge (pointe vers la page de vérification)
    const qrCodeData = await generateEventQRCode(badgeCode);

    const badge = await Badge.create({
      eventId: registration.eventId._id,
      registrationId: registration._id,
      participantId: registration.participantId._id,
      badgeCode,
      qrCodeData
    });

    res.status(201).json({ message: "Badge généré avec succès.", badge });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la génération du badge.", error: error.message });
  }
};

// @desc    Télécharger le badge en PDF
// @route   GET /api/badges/:badgeId/pdf
// @access  Private (Le participant ou l'admin de l'institution)
const downloadBadgePDF = async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.badgeId)
      .populate({
        path: 'eventId',
        select: 'title startDate location'
      })
      .populate('participantId', 'fullName email');

    if (!badge) {
      return res.status(404).json({ message: "Badge non trouvé." });
    }

    // Vérifier que c'est bien le propriétaire du badge ou un admin de l'institution
    const isOwner = badge.participantId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.institutionId && badge.eventId.institutionId && 
                    badge.eventId.institutionId.toString() === req.user.institutionId.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Non autorisé à télécharger ce badge." });
    }

    const badgeData = {
      eventTitle: badge.eventId.title,
      participantName: badge.participantId.fullName,
      badgeCode: badge.badgeCode,
      qrCodeData: badge.qrCodeData
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=badge-${badge.badgeCode}.pdf`);

    await generateBadgePDF(badgeData, res);

  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la génération du PDF.", error: error.message });
  }
};

// @desc    Vérifier un badge (scan QR code par l'Agent de Contrôle)
// @route   GET /api/badges/verify/:badgeCode
// @access  Public (mais utilisé par les Agents de Contrôle)
const verifyBadge = async (req, res) => {
  try {
    const badge = await Badge.findOne({ badgeCode: req.params.badgeCode })
      .populate('participantId', 'fullName email avatar')
      .populate({
        path: 'eventId',
        select: 'title startDate endDate location institutionId',
        populate: { path: 'institutionId', select: 'name logoUrl' }
      });

    if (!badge) {
      return res.status(404).json({ 
        valid: false, 
        message: "Badge invalide ou inexistant." 
      });
    }

    if (badge.status === 'cancelled') {
      return res.json({ valid: false, message: "Ce badge a été annulé.", badge });
    }

    if (badge.status === 'used') {
      return res.json({ valid: false, message: "Ce badge a déjà été utilisé.", usedAt: badge.usedAt, badge });
    }

    // Badge valide
    res.json({
      valid: true,
      message: "Badge valide ✅",
      badge
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la vérification.", error: error.message });
  }
};

// @desc    Marquer un badge comme utilisé (scan à l'entrée)
// @route   PATCH /api/badges/scan/:badgeCode
// @access  Private (Agent de Contrôle)
const scanBadge = async (req, res) => {
  try {
    const badge = await Badge.findOne({ badgeCode: req.params.badgeCode })
      .populate('participantId', 'fullName')
      .populate('eventId', 'title institutionId');

    if (!badge) {
      return res.status(404).json({ valid: false, message: "Badge invalide." });
    }

    // Vérifier que l'agent appartient à l'institution de l'événement
    if (badge.eventId.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à scanner les badges de cet événement." });
    }

    if (badge.status === 'used') {
      return res.json({ valid: false, message: "Badge déjà scanné.", usedAt: badge.usedAt });
    }

    if (badge.status === 'cancelled') {
      return res.json({ valid: false, message: "Badge annulé." });
    }

    badge.status = 'used';
    badge.usedAt = Date.now();
    await badge.save();

    res.json({
      valid: true,
      message: `Entrée validée pour ${badge.participantId.fullName} ✅`,
      badge
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du scan.", error: error.message });
  }
};

// @desc    Récupérer mes badges
// @route   GET /api/badges/me
// @access  Private
const getMyBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ participantId: req.user._id })
      .populate({
        path: 'eventId',
        select: 'title startDate location status',
        populate: { path: 'institutionId', select: 'name logoUrl' }
      })
      .sort('-createdAt');
    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

module.exports = { generateBadge, downloadBadgePDF, verifyBadge, scanBadge, getMyBadges };
