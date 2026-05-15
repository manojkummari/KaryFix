const WasteSale = require('../models/WasteSale');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

// @desc    Create a new waste pickup request
// @route   POST /api/waste/pickup
// @access  Private (Customer)
exports.createWastePickup = async (req, res) => {
  try {
    const { materialType, weight, location, scheduledDate, photos, notes } = req.body;
    console.log('Received Waste Pickup Request:', req.body);
    console.log('User:', req.user._id);

    // Price per kg based on material type
    const priceRates = {
      plastic: 15,
      paper: 8,
      metal: 25,
      glass: 5,
      electronic: 40,
      organic: 3,
      mixed: 10,
    };

    const pricePerKg = priceRates[materialType] || 10;
    const total = weight * pricePerKg;

    const wasteSale = await WasteSale.create({
      userId: req.user._id,
      materialType,
      weight,
      pricePerKg,
      total,
      location,
      scheduledDate: scheduledDate || null,
      photos: photos || [],
      notes: notes || '',
      status: 'requested',
    });

    res.status(201).json({
      success: true,
      message: 'Waste pickup request created successfully',
      data: wasteSale,
    });
  } catch (error) {
    console.error('Create waste pickup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating waste pickup request',
      error: error.message,
    });
  }
};

// @desc    Get user's waste pickups
// @route   GET /api/waste/pickup
// @access  Private (Customer)
exports.getMyWastePickups = async (req, res) => {
  try {
    const pickups = await WasteSale.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('collectorId', 'name phone')
      .populate('wasteOfficerId', 'name');

    res.status(200).json({
      success: true,
      count: pickups.length,
      data: pickups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching waste pickups',
      error: error.message,
    });
  }
};

// @desc    Get single waste pickup details
// @route   GET /api/waste/pickup/:id
// @access  Private
exports.getWastePickupById = async (req, res) => {
  try {
    const pickup = await WasteSale.findById(req.params.id)
      .populate('userId', 'name phone email')
      .populate('collectorId', 'name phone')
      .populate('wasteOfficerId', 'name');

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Waste pickup not found',
      });
    }

    res.status(200).json({
      success: true,
      data: pickup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching waste pickup',
      error: error.message,
    });
  }
};

// @desc    Get pending waste pickups (for Waste Officers)
// @route   GET /api/waste/pending
// @access  Private (Waste Officer)
exports.getPendingPickups = async (req, res) => {
  try {
    const pickups = await WasteSale.find({
      status: { $in: ['requested', 'collected'] },
    })
      .sort({ scheduledDate: 1, createdAt: 1 })
      .populate('userId', 'name phone address');

    res.status(200).json({
      success: true,
      count: pickups.length,
      data: pickups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending pickups',
      error: error.message,
    });
  }
};

// @desc    Assign waste officer to pickup
// @route   POST /api/waste/assign/:id
// @access  Private (Admin/Manager)
exports.assignWasteOfficer = async (req, res) => {
  try {
    const { wasteOfficerId } = req.body;
    
    const pickup = await WasteSale.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Waste pickup not found',
      });
    }

    pickup.wasteOfficerId = wasteOfficerId;
    await pickup.save();

    res.status(200).json({
      success: true,
      message: 'Waste officer assigned successfully',
      data: pickup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning waste officer',
      error: error.message,
    });
  }
};

// @desc    Update waste pickup status
// @route   PATCH /api/waste/pickup/:id
// @access  Private (Waste Officer)
exports.updateWasteStatus = async (req, res) => {
  try {
    const { status, weight, notes } = req.body;
    
    const pickup = await WasteSale.findById(req.params.id);
    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Waste pickup not found',
      });
    }

    // Update status
    pickup.status = status;
    
    // Update weight if provided (verified weight may differ)
    if (weight) {
      pickup.weight = weight;
      pickup.total = weight * pickup.pricePerKg;
    }

    if (notes) {
      pickup.notes = notes;
    }

    // Set timestamps based on status
    if (status === 'collected') {
      pickup.collectedDate = new Date();
      pickup.collectorId = req.user._id;
    } else if (status === 'verified') {
      pickup.verifiedDate = new Date();
      pickup.wasteOfficerId = req.user._id;
    } else if (status === 'completed' && !pickup.creditedToWallet) {
      // Credit to wallet
      const transaction = await WalletTransaction.create({
        userId: pickup.userId,
        type: 'credit',
        amount: pickup.total,
        description: `Waste sale: ${pickup.weight}kg ${pickup.materialType}`,
        status: 'completed',
        referenceType: 'waste-sale',
        referenceId: pickup._id,
      });

      // Update user wallet balance
      await User.findByIdAndUpdate(pickup.userId, {
        $inc: { 'wallet.balance': pickup.total },
      });

      pickup.creditedToWallet = true;
      pickup.walletTransactionId = transaction._id;
    }

    await pickup.save();

    res.status(200).json({
      success: true,
      message: `Waste pickup status updated to ${status}`,
      data: pickup,
    });
  } catch (error) {
    console.error('Update waste status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating waste pickup status',
      error: error.message,
    });
  }
};

// @desc    Get waste statistics
// @route   GET /api/waste/stats
// @access  Private (Waste Officer/Admin)
exports.getWasteStats = async (req, res) => {
  try {
    const stats = await WasteSale.aggregate([
      {
        $group: {
          _id: '$materialType',
          totalWeight: { $sum: '$weight' },
          totalValue: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ]);

    const overview = await WasteSale.aggregate([
      {
        $group: {
          _id: null,
          totalPickups: { $sum: 1 },
          totalWeight: { $sum: '$weight' },
          totalValue: { $sum: '$total' },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'requested'] }, 1, 0] },
          },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byMaterial: stats,
        overview: overview[0] || {
          totalPickups: 0,
          totalWeight: 0,
          totalValue: 0,
          pendingCount: 0,
          completedCount: 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching waste statistics',
      error: error.message,
    });
  }
};
