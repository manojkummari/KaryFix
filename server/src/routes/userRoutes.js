const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  updateVerificationStatus,
  updateUserRole,
  deleteUser,
  getUserStats,
} = require('../controllers/userController');

// All routes require admin access
router.use(requireAuth, requireRole('admin'));

router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.patch('/:id/verify', updateVerificationStatus);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;
