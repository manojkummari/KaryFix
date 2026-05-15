const EmergencyAlert = require('../models/EmergencyAlert');

// @desc    Trigger SOS alert
// @route   POST /api/emergency/sos
// @access  Private (Technician, Customer, Waste Officer)
exports.triggerSOS = async (req, res) => {
  try {
    const { location, bookingId, notes } = req.body;

    const alert = await EmergencyAlert.create({
      userId: req.user._id,
      userRole: req.user.role,
      bookingId: bookingId || null,
      location: location || { address: '', coordinates: [0, 0] },
      notes: notes || '',
      status: 'active',
    });

    // Emit socket event to admin room
    const io = req.app.get('io');
    if (io) {
      io.emit('emergency:new', {
        alert: await alert.populate('userId', 'name phone email'),
        message: `Emergency SOS triggered by ${req.user.name} (${req.user.role})`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Emergency alert sent successfully. Help is on the way!',
      data: alert,
    });
  } catch (error) {
    console.error('Trigger SOS error:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering emergency alert',
      error: error.message,
    });
  }
};

// @desc    Get active emergency alerts
// @route   GET /api/emergency/active
// @access  Private (Admin, Manager)
exports.getActiveAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({
      status: { $in: ['active', 'acknowledged'] },
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name phone email role')
      .populate('bookingId', 'subServiceId status')
      .populate('respondedBy', 'name');

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active alerts',
      error: error.message,
    });
  }
};

// @desc    Get all emergency alerts (history)
// @route   GET /api/emergency/history
// @access  Private (Admin)
exports.getAlertHistory = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'name phone email role')
      .populate('respondedBy', 'name');

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alert history',
      error: error.message,
    });
  }
};

// @desc    Acknowledge an emergency alert
// @route   PATCH /api/emergency/:id/ack
// @access  Private (Admin, Manager)
exports.acknowledgeAlert = async (req, res) => {
  try {
    const alert = await EmergencyAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Emergency alert not found',
      });
    }

    if (alert.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Alert is not active',
      });
    }

    alert.status = 'acknowledged';
    alert.respondedBy = req.user._id;
    alert.acknowledgedAt = new Date();
    await alert.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('emergency:acknowledged', {
        alertId: alert._id,
        respondedBy: req.user.name,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged',
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error acknowledging alert',
      error: error.message,
    });
  }
};

// @desc    Resolve an emergency alert
// @route   PATCH /api/emergency/:id/resolve
// @access  Private (Admin, Manager)
exports.resolveAlert = async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    const alert = await EmergencyAlert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Emergency alert not found',
      });
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    alert.resolutionNotes = resolutionNotes || '';
    if (!alert.respondedBy) {
      alert.respondedBy = req.user._id;
    }
    await alert.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('emergency:resolved', {
        alertId: alert._id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert resolved',
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resolving alert',
      error: error.message,
    });
  }
};

// @desc    Get user's own SOS history
// @route   GET /api/emergency/my-alerts
// @access  Private
exports.getMyAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('respondedBy', 'name');

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message,
    });
  }
};
