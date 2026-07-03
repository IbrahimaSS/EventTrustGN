const express = require('express');
const router = express.Router();
const { sendOTP, verify } = require('../controllers/otp.controller');

router.post('/send', sendOTP);
router.post('/verify', verify);

module.exports = router;
