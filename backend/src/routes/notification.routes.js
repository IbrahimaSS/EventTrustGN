const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

module.exports = router;
