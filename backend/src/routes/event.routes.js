const express = require('express');
const router = express.Router();
const { createEvent, publishEvent, getEventByCode, getEventBySlug, getEvents, getInstitutionEvents, getEventById, updateEvent, getAllEventsAdmin, updateEventStatusAdmin } = require('../controllers/event.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.get('/', getEvents);
router.get('/code/:code', getEventByCode);
router.get('/slug/:slug', getEventBySlug);

// Les routes de création et publication sont réservées aux admins d'institution et responsables communication
router.get('/institution', protect, authorize('Admin Institution', 'Responsable Communication'), getInstitutionEvents);
router.post('/', protect, authorize('Admin Institution', 'Responsable Communication'), createEvent);
router.get('/:id', protect, getEventById);
router.put('/:id', protect, authorize('Admin Institution', 'Responsable Communication'), updateEvent);
router.patch('/:id/publish', protect, authorize('Admin Institution', 'Responsable Communication'), publishEvent);
// Routes Super Admin
router.get('/admin/all', protect, authorize('Super Admin'), getAllEventsAdmin);
router.patch('/admin/:id/status', protect, authorize('Super Admin'), updateEventStatusAdmin);

module.exports = router;
