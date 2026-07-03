const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUserRole, updateUserStatus } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

// Toutes les routes utilisateurs sont réservées au Super Admin
router.use(protect);
router.use(authorize('Super Admin'));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUserById);

router.patch('/:id/role', updateUserRole);
router.patch('/:id/status', updateUserStatus);

module.exports = router;
