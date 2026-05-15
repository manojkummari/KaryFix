const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  assignTechnician,
  updateBookingPrice,
  addBookingPhotos,
  addBookingReview,
  getAllBookings,
  getBookingStats,
  getAvailableBookings,
  requestBooking,
  approveBookingRequest,
  verifyPayment,
} = require('../controllers/bookingController');
const { requireAuth, requireRole } = require('../middleware/auth');

// ============ CUSTOMER/TECHNICIAN ROUTES ============

// Create booking (customer only)
router.post('/', requireAuth, requireRole('customer'), createBooking);

// Verify Razorpay payment
router.post('/:id/verify-payment', requireAuth, requireRole('customer'), verifyPayment);

// Get current user's bookings (customer or technician)
router.get('/my-bookings', requireAuth, getMyBookings);

// Get available bookings (technician only) - MUST BE BEFORE /:id
router.get('/available', requireAuth, requireRole('technician'), getAvailableBookings);

// Get specific booking
router.get('/:id', requireAuth, getBookingById);

// Update booking status
router.put('/:id/status', requireAuth, updateBookingStatus);

// Request booking (technician only)
router.put('/:id/request', requireAuth, requireRole('technician'), requestBooking);

// Add photos to booking
router.post('/:id/photos', requireAuth, addBookingPhotos);

// Add review (customer only)
router.post('/:id/review', requireAuth, requireRole('customer'), addBookingReview);

// Update booking price (technician only)
router.put('/:id/price', requireAuth, requireRole('technician'), updateBookingPrice);

// ============ ADMIN/MANAGER ROUTES ============

// Get all bookings
router.get('/admin/all', requireAuth, requireRole('admin', 'manager'), getAllBookings);

// Get booking statistics
router.get('/admin/stats', requireAuth, requireRole('admin', 'manager'), getBookingStats);

// Approve booking request (admin only)
router.put('/:id/approve', requireAuth, requireRole('admin', 'manager'), approveBookingRequest);

// Assign technician to booking
router.put('/:id/assign', requireAuth, requireRole('admin', 'manager'), assignTechnician);

module.exports = router;
