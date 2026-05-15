const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
} = require('../controllers/authController');

const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

// Protected routes
router.get('/me', requireAuth, getMe);
router.post('/logout', requireAuth, logout);
router.put('/update-details', requireAuth, updateDetails);
router.put('/update-password', requireAuth, updatePassword);

module.exports = router;
