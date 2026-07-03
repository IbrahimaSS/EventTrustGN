const express = require('express');
const router = express.Router();
const { getAllReportsAdmin, updateReportsStatus } = require('../controllers/moderation.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(protect);
router.use(authorize('Super Admin'));

router.get('/reports', getAllReportsAdmin);
router.patch('/reports', updateReportsStatus);

module.exports = router;
