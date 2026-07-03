const express = require('express');
const router = express.Router();
const { startPayment, lengoPayWebhook, getMyPayments } = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/initiate', protect, startPayment);
router.get('/me', protect, getMyPayments);

// Le webhook ne doit pas avoir le middleware 'protect' car c'est une API externe (Lengo Pay) qui l'appelle
router.post('/lengo/webhook', lengoPayWebhook);

module.exports = router;
