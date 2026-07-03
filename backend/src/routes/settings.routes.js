const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settings.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.get('/', protect, authorize('Super Admin'), getSettings);
router.patch('/', protect, authorize('Super Admin'), updateSettings);

module.exports = router;
