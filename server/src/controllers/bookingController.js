const Booking = require('../models/Booking');
const ServiceCategory = require('../models/ServiceCategory');
const SubService = require('../models/SubService');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Helper function to emit jobs to technicians
const emitToNearbyTechnicians = async (booking, location, io) => {
  // Find nearby technicians within 60 KM using JS filtering to avoid MongoDB index errors
  const TechnicianProfile = require('../models/TechnicianProfile');
  const allAvailableTechs = await TechnicianProfile.find({
    availability: true,
  });

  const [bookLng, bookLat] = location.coordinates;
  const nearbyTechnicians = allAvailableTechs.filter(tech => {
    if (!tech.currentLocation || !tech.currentLocation.coordinates || tech.currentLocation.coordinates.length !== 2) {
      return false;
    }
    const [techLng, techLat] = tech.currentLocation.coordinates;
    if (techLng === 0 && techLat === 0) return false;

    const R = 6371; // Radius of the earth in km
    const dLat = (bookLat - techLat) * (Math.PI / 180);
    const dLon = (bookLng - techLng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(techLat * (Math.PI / 180)) * Math.cos(bookLat * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    return distance <= 60; // Within 60 KM
  });

  // Emit to nearby technicians
  if (io && nearbyTechnicians.length > 0) {
    nearbyTechnicians.forEach((tech) => {
      io.to(`technician-${tech.userId.toString()}`).emit('new-job-request', booking);
    });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private/Customer
exports.createBooking = async (req, res) => {
  try {
    const {
      categoryId,
      subServiceId,
      description,
      location,
      scheduledDate,
      photos,
      paymentMethod = 'cash',
    } = req.body;

    // Verify category exists
    const category = await ServiceCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Service category not found',
        },
      });
    }

    // Verify subservice exists and belongs to category
    const subService = await SubService.findById(subServiceId);
    if (!subService) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SUBSERVICE_NOT_FOUND',
          message: 'Subservice not found',
        },
      });
    }

    if (subService.categoryId.toString() !== categoryId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SUBSERVICE',
          message: 'Subservice does not belong to selected category',
        },
      });
    }

    // Validate scheduledDate is not in the past
    if (scheduledDate) {
      const scheduled = new Date(scheduledDate);
      if (scheduled <= new Date()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SCHEDULED_DATE',
            message: 'Scheduled date and time must be in the future',
          },
        });
      }
    }

    // Set estimated price from subservice
    const estimatedPrice = subService.priceRange.min;

    const booking = await Booking.create({
      customerId: req.user._id,
      categoryId,
      subServiceId,
      category: category.name, // Legacy field
      subService: subService.name, // Legacy field
      description,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address,
      },
      scheduledDate,
      photos: photos || [],
      price: {
        estimated: estimatedPrice,
        final: 0,
      },
      paymentMethod,
      status: paymentMethod === 'online' ? 'payment_pending' : 'pending',
    });

    // Populate references before sending response
    await booking.populate([
      { path: 'categoryId', select: 'name slug icon' },
      { path: 'subServiceId', select: 'name slug priceRange estimatedDuration' },
      { path: 'customerId', select: 'name email phone' },
    ]);

    if (paymentMethod === 'online') {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: estimatedPrice * 100, // amount in smallest currency unit (paise)
        currency: 'INR',
        receipt: `receipt_order_${booking._id}`,
      };

      try {
        const order = await razorpay.orders.create(options);
        return res.status(201).json({
          success: true,
          data: booking,
          razorpayOrder: order,
        });
      } catch (orderErr) {
        console.error('Razorpay Order Error:', orderErr);
        return res.status(500).json({
          success: false,
          error: {
            code: 'PAYMENT_GATEWAY_ERROR',
            message: 'Failed to create payment order',
          },
        });
      }
    }

    // If cash, emit to nearby technicians immediately
    const io = req.app.get('io');
    await emitToNearbyTechnicians(booking, location, io);

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create booking',
      },
    });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/bookings/:id/verify-payment
// @access  Private/Customer
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId).populate([
      { path: 'categoryId', select: 'name slug icon' },
      { path: 'subServiceId', select: 'name slug priceRange estimatedDuration' },
      { path: 'customerId', select: 'name email phone' },
    ]);

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      booking.status = 'pending';
      booking.paymentStatus = 'paid';
      booking.paymentDetails = {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      };

      booking.statusTimeline.push({
        status: 'pending',
        timestamp: new Date(),
        note: 'Payment successful, booking submitted to technicians',
      });

      await booking.save();

      // Emit to nearby technicians now that payment is successful
      const io = req.app.get('io');
      await emitToNearbyTechnicians(booking, booking.location, io);

      return res.status(200).json({ success: true, message: 'Payment verified successfully', data: booking });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid signature sent!' });
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify payment' });
  }
};

// @desc    Get all bookings for current user
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};

    // Build query based on user role
    if (userRole === 'customer') {
      query.customerId = userId;
    } else if (userRole === 'technician') {
      query.technicianId = userId;
    } else {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only customers and technicians can view their bookings',
        },
      });
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('categoryId', 'name slug icon')
      .populate('subServiceId', 'name slug priceRange estimatedDuration')
      .populate('customerId', 'name email phone')
      .populate('technicianId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: bookings,
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch bookings',
      },
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('categoryId', 'name slug icon description')
      .populate('subServiceId', 'name slug priceRange estimatedDuration features')
      .populate('customerId', 'name email phone')
      .populate('technicianId', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    // Check if user has access to this booking
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    const isCustomer = booking.customerId._id.toString() === userId;
    const isTechnician = booking.technicianId && booking.technicianId._id.toString() === userId;
    const isAdmin = userRole === 'admin' || userRole === 'manager';

    if (!isCustomer && !isTechnician && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this booking',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch booking',
      },
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const booking = await Booking.findById(id);
    const io = req.app.get('io');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    // Validate status transitions based on user role
    const userRole = req.user.role;
    const userId = req.user._id.toString();

    const validStatuses = [
      'pending',
      'assigned',
      'accepted',
      'on-the-way',
      'in-progress',
      'verification_pending',
      'completed',
      'cancelled',
      'rejected',
      'requested',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Invalid booking status',
        },
      });
    }

    // Role-based status update validation
    if (userRole === 'customer') {
      const isOwner = booking.customerId.toString() === userId;
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only update your own bookings',
          },
        });
      }

      // Customers can:
      // 1. Cancel their own bookings
      // 2. Mark as completed (verify) when status is verification_pending
      if (status !== 'cancelled' && status !== 'completed') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Customers can only cancel or complete bookings',
          },
        });
      }

      // If completing, ensure it's in verification_pending state (optional but good for safety)
      if (status === 'completed' && booking.status !== 'verification_pending') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TRANSITION',
            message: 'Can only complete bookings that are pending verification',
          },
        });
      }

    } else if (userRole === 'technician') {
      // Technicians can only update their assigned bookings
      const isAssigned = booking.technicianId && booking.technicianId.toString() === userId;
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only update bookings assigned to you',
          },
        });
      }
    }

    // If the booking is being completed, update the technician's earnings
    if (status === 'completed' && booking.status !== 'completed') {
      if (booking.technicianId) {
        const TechnicianProfile = require('../models/TechnicianProfile');
        const techProfile = await TechnicianProfile.findOne({ userId: booking.technicianId });

        if (techProfile) {
          const amountEarned = booking.price?.final > 0 ? booking.price.final : (booking.price?.estimated || 0);
          techProfile.earnings.total += amountEarned;
          techProfile.earnings.completed += amountEarned;
          await techProfile.save();

          // Add net earnings to user's wallet
          const commission = Math.round(amountEarned * 0.1);
          const netEarnings = amountEarned - commission;

          const User = require('../models/User');
          const userObj = await User.findById(booking.technicianId);
          if (userObj) {
            userObj.wallet.balance += netEarnings;
            userObj.wallet.transactions.push({
              type: 'credit',
              amount: netEarnings,
              description: `Earnings from booking ${booking._id} (Net after 10% commission)`,
            });
            await userObj.save();
          }
        }
      }

      // Automatically mark cash bookings as paid when completed
      if (booking.paymentMethod === 'cash' && booking.paymentStatus !== 'paid') {
        booking.paymentStatus = 'paid';
      }
    }

    // Update status
    booking.status = status;
    booking.statusTimeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`,
    });

    await booking.save();

    await booking.populate([
      { path: 'categoryId', select: 'name slug icon' },
      { path: 'subServiceId', select: 'name slug priceRange' },
      { path: 'customerId', select: 'name email phone' },
      { path: 'technicianId', select: 'name email phone' },
    ]);

    // Emit Socket.io event for real-time updates
    if (io) {
      io.to(`booking-${id}`).emit('booking-status-updated', {
        bookingId: id,
        status,
        statusTimeline: booking.statusTimeline,
        updatedAt: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update booking status',
      },
    });
  }
};

// @desc    Assign technician to booking
// @route   PUT /api/bookings/:id/assign
// @access  Private/Manager/Admin
exports.assignTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { technicianId } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    // Verify technician exists and has correct role
    const technician = await User.findById(technicianId);
    if (!technician || technician.role !== 'technician') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TECHNICIAN_NOT_FOUND',
          message: 'Technician not found',
        },
      });
    }

    booking.technicianId = technicianId;
    booking.status = 'assigned';
    booking.statusTimeline.push({
      status: 'assigned',
      timestamp: new Date(),
      note: `Assigned to technician: ${technician.name}`,
    });

    await booking.save();

    await booking.populate([
      { path: 'categoryId', select: 'name slug icon' },
      { path: 'subServiceId', select: 'name slug priceRange' },
      { path: 'customerId', select: 'name email phone' },
      { path: 'technicianId', select: 'name email phone' },
    ]);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Assign technician error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to assign technician',
      },
    });
  }
};

// @desc    Update booking price
// @route   PUT /api/bookings/:id/price
// @access  Private/Technician
exports.updateBookingPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { finalPrice } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    // Verify technician is assigned to this booking
    const userId = req.user._id.toString();
    const isAssigned = booking.technicianId && booking.technicianId.toString() === userId;

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only assigned technician can update price',
        },
      });
    }

    if (finalPrice < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PRICE',
          message: 'Price cannot be negative',
        },
      });
    }

    booking.price.final = finalPrice;
    await booking.save();

    await booking.populate([
      { path: 'categoryId', select: 'name slug icon' },
      { path: 'subServiceId', select: 'name slug priceRange' },
      { path: 'customerId', select: 'name email phone' },
      { path: 'technicianId', select: 'name email phone' },
    ]);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Update booking price error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update booking price',
      },
    });
  }
};

// @desc    Add photos to booking
// @route   POST /api/bookings/:id/photos
// @access  Private
exports.addBookingPhotos = async (req, res) => {
  try {
    const { id } = req.params;
    const { photos } = req.body; // Array of {url, uploadedBy}

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    // Verify user has access to this booking
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    const isCustomer = booking.customerId.toString() === userId;
    const isTechnician = booking.technicianId && booking.technicianId.toString() === userId;

    if (!isCustomer && !isTechnician) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this booking',
        },
      });
    }

    // Determine who is uploading
    const uploadedBy = userRole === 'customer' ? 'customer' : 'technician';

    // Add photos
    const newPhotos = photos.map((photo) => ({
      url: photo.url,
      uploadedBy,
      uploadedAt: new Date(),
    }));

    booking.photos.push(...newPhotos);
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Add booking photos error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to add photos',
      },
    });
  }
};

// @desc    Add rating and review
// @route   POST /api/bookings/:id/review
// @access  Private/Customer
exports.addBookingReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, review } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    // Verify customer owns this booking
    const userId = req.user._id.toString();
    const isOwner = booking.customerId.toString() === userId;

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only the customer can review this booking',
        },
      });
    }

    // Only allow review if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_COMPLETED',
          message: 'Can only review completed bookings',
        },
      });
    }

    // Validate score
    if (score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SCORE',
          message: 'Rating score must be between 1 and 5',
        },
      });
    }

    booking.rating.score = score;
    booking.rating.review = review || '';
    await booking.save();

    await booking.populate([
      { path: 'categoryId', select: 'name slug icon' },
      { path: 'subServiceId', select: 'name slug priceRange' },
      { path: 'customerId', select: 'name email phone' },
      { path: 'technicianId', select: 'name email phone' },
    ]);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Add booking review error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to add review',
      },
    });
  }
};

// @desc    Get available bookings (pending and unassigned)
// @route   GET /api/bookings/available
// @access  Private/Technician
exports.getAvailableBookings = async (req, res) => {
  try {
    const { categoryId, page = 1, limit = 10 } = req.query;

    let query = {
      status: 'pending',
      technicianId: null,
    };

    if (categoryId) {
      query.categoryId = categoryId;
    }

    // Get the requesting technician's profile to find their current location
    const TechnicianProfile = require('../models/TechnicianProfile');
    const profile = await TechnicianProfile.findOne({ userId: req.user._id });

    let technicianCoords = null;
    if (profile && profile.currentLocation && profile.currentLocation.coordinates.length === 2 && profile.currentLocation.coordinates[0] !== 0) {
      technicianCoords = profile.currentLocation.coordinates;
    } else if (profile && profile.location && profile.location.coordinates.length === 2 && profile.location.coordinates[0] !== 0) {
      // Fallback to registered base location
      technicianCoords = profile.location.coordinates;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let bookings = await Booking.find(query)
      .populate('customerId', 'name avatar')
      .populate('categoryId', 'name icon')
      .populate('subServiceId', 'name priceRange estimatedDuration')
      .sort('-createdAt');

    // Filter by 60 KM radius in JavaScript to avoid MongoDB 2dsphere index errors with legacy data
    if (technicianCoords) {
      const [techLng, techLat] = technicianCoords;
      bookings = bookings.filter(booking => {
        if (!booking.location || !booking.location.coordinates || booking.location.coordinates.length !== 2) {
          return false; // Skip bookings with invalid locations
        }
        const [bookLng, bookLat] = booking.location.coordinates;
        if (bookLng === 0 && bookLat === 0) return false; // Skip default 0,0 locations

        // Haversine formula
        const R = 6371; // Radius of the earth in km
        const dLat = (bookLat - techLat) * (Math.PI / 180);
        const dLon = (bookLng - techLng) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(techLat * (Math.PI / 180)) * Math.cos(bookLat * (Math.PI / 180)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km

        return distance <= 60; // Within 60 KM
      });
    }

    const total = bookings.length;

    // Apply pagination after filtering
    bookings = bookings.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: bookings,
    });
  } catch (error) {
    console.error('Get available bookings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch available bookings',
      },
    });
  }
};

// @desc    Accept a booking (instant assignment)
// @route   PUT /api/bookings/:id/request
// @access  Private/Technician
exports.requestBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      status: 'pending',
      technicianId: null,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found or already assigned',
        },
      });
    }

    booking.technicianId = req.user._id;
    booking.status = 'assigned';
    booking.statusTimeline.push({
      status: 'assigned',
      note: `Technician ${req.user.name} accepted this job`,
    });

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking accepted successfully.',
    });
  } catch (error) {
    console.error('Request booking error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to request booking',
      },
    });
  }
};

// @desc    Approve booking request
// @route   PUT /api/bookings/:id/approve
// @access  Private/Admin/Manager
exports.approveBookingRequest = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('technicianId', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Booking not found',
        },
      });
    }

    if (booking.status !== 'requested') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Booking is not in requested status',
        },
      });
    }

    booking.status = 'assigned';
    booking.statusTimeline.push({
      status: 'assigned',
      note: `Booking approved by admin for technician ${booking.technicianId.name}`,
    });

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking request approved successfully',
    });
  } catch (error) {
    console.error('Approve booking request error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to approve booking request',
      },
    });
  }
};

// ============ ADMIN/MANAGER ROUTES ============

// @desc    Get all bookings (admin/manager)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin/Manager
exports.getAllBookings = async (req, res) => {
  try {
    const { status, categoryId, technicianId, page = 1, limit = 20 } = req.query;

    let query = {};

    if (status) query.status = status;
    if (categoryId) query.categoryId = categoryId;
    if (technicianId) query.technicianId = technicianId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('categoryId', 'name slug icon')
      .populate('subServiceId', 'name slug priceRange')
      .populate('customerId', 'name email phone')
      .populate('technicianId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: bookings,
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch bookings',
      },
    });
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/admin/stats
// @access  Private/Admin/Manager
exports.getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const activeBookings = await Booking.countDocuments({
      status: { $in: ['assigned', 'accepted', 'on-the-way', 'in-progress'] },
    });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Calculate total revenue
    const revenueData = await Booking.aggregate([
      { $match: { status: 'completed', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$price.final' } } },
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        activeBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch booking statistics',
      },
    });
  }
};
