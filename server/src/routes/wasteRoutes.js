const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  createWastePickup,
  getMyWastePickups,
  getWastePickupById,
  getPendingPickups,
  assignWasteOfficer,
  updateWasteStatus,
  getWasteStats,
} = require('../controllers/wasteController');

// Customer routes
router.post('/pickup', requireAuth, createWastePickup);
router.get('/pickup', requireAuth, getMyWastePickups);
router.get('/pickup/:id', requireAuth, getWastePickupById);

// Waste Officer routes
router.get('/pending', requireAuth, requireRole('wasteOfficer', 'admin'), getPendingPickups);
router.patch('/pickup/:id', requireAuth, requireRole('wasteOfficer', 'admin'), updateWasteStatus);
router.get('/stats', requireAuth, requireRole('wasteOfficer', 'admin'), getWasteStats);

// Admin/Manager routes
router.post('/assign/:id', requireAuth, requireRole('admin', 'manager'), assignWasteOfficer);

module.exports = router;
