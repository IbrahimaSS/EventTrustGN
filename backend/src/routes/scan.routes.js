const express = require('express');
const router = express.Router();
const { getEventScans } = require('../controllers/scan.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(protect);

router.get('/event/:eventId', authorize('Admin Institution', 'Gestionnaire d\'Inscriptions', 'Agent de Contrôle'), getEventScans);

module.exports = router;
