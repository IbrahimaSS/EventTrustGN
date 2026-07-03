const express = require('express');
const router = express.Router();
const { getAllSubscriptionsAdmin, createSubscriptionAdmin, updateSubscriptionAdmin, deleteSubscriptionAdmin, remindSubscriptionAdmin } = require('../controllers/subscription.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(protect);
router.use(authorize('Super Admin'));

router.get('/admin/all', getAllSubscriptionsAdmin);
router.post('/admin', createSubscriptionAdmin);
router.patch('/admin/:id', updateSubscriptionAdmin);
router.delete('/admin/:id', deleteSubscriptionAdmin);
router.post('/admin/:id/remind', remindSubscriptionAdmin);

module.exports = router;
