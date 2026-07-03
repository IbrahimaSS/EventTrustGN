const express = require('express');
const router = express.Router();
const { registerForEvent, getMyRegistrations, updateRegistrationStatus, getInstitutionRegistrations, getInstitutionParticipants, bulkRegister, scanBadge, getScanLogs, getInstitutionAnalytics } = require('../controllers/registration.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Inscription à un événement (Note: l'URL devrait techniquement être sous /api/events/:id/register, on le gère ici pour simplifier)
router.post('/event/:id', protect, registerForEvent);

// Récupérer ses propres inscriptions
router.get('/me', protect, getMyRegistrations);

// Récupérer les inscriptions pour l'institution
router.get('/institution', protect, authorize('Admin Institution', 'Gestionnaire d\'Inscriptions', 'Responsable Communication'), getInstitutionRegistrations);

// Importer des inscriptions en masse via CSV
router.post('/institution/bulk', protect, authorize('Admin Institution', 'Gestionnaire d\'Inscriptions', 'Responsable Communication'), bulkRegister);

// Récupérer les participants uniques pour l'institution
router.get('/institution/participants', protect, authorize('Admin Institution', 'Gestionnaire d\'Inscriptions', 'Responsable Communication'), getInstitutionParticipants);

// Analytiques de l'institution
router.get('/institution/analytics', protect, authorize('Admin Institution', 'Responsable Communication'), getInstitutionAnalytics);

// Mettre à jour le statut (validation manuelle par les gestionnaires)
router.patch('/:id/status', protect, authorize('Admin Institution', 'Gestionnaire d\'Inscriptions'), updateRegistrationStatus);

// Récupérer les logs de scan
router.get('/institution/scans', protect, authorize('Admin Institution', 'Agent de Scan'), getScanLogs);

// Scanner un badge
router.post('/scan', protect, authorize('Admin Institution', 'Agent de Scan'), scanBadge);

module.exports = router;
