const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { updateLocation, getTechnicianLocation } = require('../controllers/trackingController');

// Technician updates their location
router.post('/update-location', requireAuth, requireRole('technician'), updateLocation);

// Get technician location for a booking
router.get('/booking/:id', requireAuth, getTechnicianLocation);

module.exports = router;
