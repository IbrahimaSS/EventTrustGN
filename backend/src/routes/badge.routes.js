const express = require('express');
const router = express.Router();
const { generateBadge, downloadBadgePDF, verifyBadge, scanBadge, getMyBadges } = require('../controllers/badge.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Routes publiques (vérification par QR Code)
router.get('/verify/:badgeCode', verifyBadge);

// Routes participant
router.get('/me', protect, getMyBadges);
router.get('/:badgeId/pdf', protect, downloadBadgePDF);

// Routes gestionnaires
router.post('/generate/:registrationId', protect, authorize('Admin Institution', 'Gestionnaire d\'Inscriptions'), generateBadge);

// Routes agents de contrôle
router.patch('/scan/:badgeCode', protect, authorize('Admin Institution', 'Agent de Contrôle'), scanBadge);

module.exports = router;
