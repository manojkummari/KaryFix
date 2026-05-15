const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { getDashboardStats, getAnalytics, createUser } = require('../controllers/adminController');

// All routes require admin access
router.use(requireAuth, requireRole('admin'));

router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.post('/users', createUser);

module.exports = router;
