const TechnicianProfile = require('../models/TechnicianProfile');
const Booking = require('../models/Booking');

// @desc    Update technician location
// @route   POST /api/tracking/update-location
// @access  Private (Technician)
exports.updateLocation = async (req, res) => {
  try {
    const { coordinates, bookingId } = req.body;

    // Update technician profile with current location
    let profile = await TechnicianProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      profile = await TechnicianProfile.create({
        userId: req.user._id,
        categoryId: null,
      });
    }

    profile.currentLocation = {
      coordinates,
      updatedAt: new Date(),
    };
    await profile.save();

    // Emit to booking room if bookingId provided
    if (bookingId) {
      const io = req.app.get('io');
      if (io) {
        io.to(`booking-${bookingId}`).emit('location-updated', {
          coordinates,
          timestamp: new Date(),
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Location updated',
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating location',
      error: error.message,
    });
  }
};

// @desc    Get technician location for a booking
// @route   GET /api/tracking/booking/:id
// @access  Private
exports.getTechnicianLocation = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('technicianId', 'name phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (!booking.technicianId) {
      return res.status(400).json({
        success: false,
        message: 'No technician assigned to this booking',
      });
    }

    const profile = await TechnicianProfile.findOne({ userId: booking.technicianId._id });

    const locationData = {
      technician: {
        name: booking.technicianId.name,
        phone: booking.technicianId.phone,
      },
      location: profile?.currentLocation || null,
      bookingStatus: booking.status,
      customerLocation: booking.location,
    };

    res.status(200).json({
      success: true,
      data: locationData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching location',
      error: error.message,
    });
  }
};
