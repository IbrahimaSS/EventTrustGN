const express = require('express');
const router = express.Router();
const { verifyCode } = require('../controllers/verify.controller');

router.get('/:code', verifyCode);

module.exports = router;
