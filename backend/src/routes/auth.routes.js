const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe, updatePassword, getAllUsersAdmin, updateUserStatusAdmin } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/password', protect, updatePassword);

// Super Admin routes
router.get('/admin/users', protect, authorize('Super Admin'), getAllUsersAdmin);
router.patch('/admin/users/:id/status', protect, authorize('Super Admin'), updateUserStatusAdmin);

module.exports = router;
