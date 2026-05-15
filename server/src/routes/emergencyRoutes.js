const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  triggerSOS,
  getActiveAlerts,
  getAlertHistory,
  acknowledgeAlert,
  resolveAlert,
  getMyAlerts,
} = require('../controllers/emergencyController');

// Trigger SOS (any authenticated user)
router.post('/sos', requireAuth, triggerSOS);

// Get user's own alerts
router.get('/my-alerts', requireAuth, getMyAlerts);

// Admin/Manager routes
router.get('/active', requireAuth, requireRole('admin', 'manager'), getActiveAlerts);
router.get('/history', requireAuth, requireRole('admin'), getAlertHistory);
router.patch('/:id/ack', requireAuth, requireRole('admin', 'manager'), acknowledgeAlert);
router.patch('/:id/resolve', requireAuth, requireRole('admin', 'manager'), resolveAlert);

module.exports = router;
