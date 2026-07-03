const express = require('express');
const router = express.Router();
const { getSuperAdminDashboard, getInstitutionDashboard, getParticipantDashboard, getSuperAdminAnalytics } = require('../controllers/dashboard.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(protect);

router.get('/super-admin', authorize('Super Admin'), getSuperAdminDashboard);
router.get('/super-admin/analytics', authorize('Super Admin'), getSuperAdminAnalytics);
router.get('/institution', authorize('Admin Institution', 'Responsable Communication', 'Gestionnaire d\'Inscriptions'), getInstitutionDashboard);
router.get('/participant', authorize('Participant'), getParticipantDashboard);

module.exports = router;
