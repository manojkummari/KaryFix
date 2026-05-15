const User = require('../models/User');
const Booking = require('../models/Booking');
const ServiceCategory = require('../models/ServiceCategory');
const SubService = require('../models/SubService');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const pendingVerifications = await User.countDocuments({ isVerified: false });
    
    // New users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    
    // Booking stats
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ 
      status: { $in: ['pending', 'accepted', 'on-the-way', 'in-progress'] } 
    });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    
    // Bookings this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const bookingsThisMonth = await Booking.countDocuments({ createdAt: { $gte: startOfMonth } });
    
    // Revenue calculation (from completed bookings)
    const revenueData = await Booking.aggregate([
      { $match: { status: 'completed', 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$payment.amount' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;
    
    // Revenue this month
    const monthlyRevenueData = await Booking.aggregate([
      { 
        $match: { 
          status: 'completed', 
          'payment.status': 'paid',
          createdAt: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$payment.amount' } } }
    ]);
    const revenueThisMonth = monthlyRevenueData[0]?.total || 0;
    
    // Service stats
    const totalCategories = await ServiceCategory.countDocuments();
    const totalSubServices = await SubService.countDocuments();
    
    // Recent bookings for activity feed
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customerId', 'name')
      .populate('technicianId', 'name')
      .select('_id status createdAt customerId technicianId');
    
    // Recent users for activity feed
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name role createdAt isVerified');
    
    // Build activity feed
    const activities = [];
    
    recentBookings.forEach(booking => {
      activities.push({
        type: booking.status === 'pending' ? 'warning' : 
              booking.status === 'completed' ? 'success' : 'blue',
        title: `Booking #${booking._id.toString().slice(-6)} - ${booking.status}`,
        time: booking.createdAt,
        category: 'booking'
      });
    });
    
    recentUsers.forEach(user => {
      activities.push({
        type: user.isVerified ? 'success' : 'blue',
        title: `New ${user.role}: ${user.name}`,
        time: user.createdAt,
        category: 'user'
      });
    });
    
    // Sort by time and limit
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivities = activities.slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byRole: usersByRole,
          newThisWeek: newUsersThisWeek,
          pendingVerifications
        },
        bookings: {
          total: totalBookings,
          active: activeBookings,
          completed: completedBookings,
          thisMonth: bookingsThisMonth
        },
        revenue: {
          total: totalRevenue,
          thisMonth: revenueThisMonth
        },
        services: {
          categories: totalCategories,
          subServices: totalSubServices
        },
        recentActivities
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message,
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    // Total revenue
    const totalRevenueData = await Booking.aggregate([
      { $match: { status: 'completed', 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$payment.amount' } } }
    ]);
    const totalRevenue = totalRevenueData[0]?.total || 0;
    
    // This month revenue
    const thisMonthRevenueData = await Booking.aggregate([
      { $match: { status: 'completed', 'payment.status': 'paid', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$payment.amount' } } }
    ]);
    const thisMonthRevenue = thisMonthRevenueData[0]?.total || 0;
    
    // Last month revenue (for trend calculation)
    const lastMonthRevenueData = await Booking.aggregate([
      { $match: { status: 'completed', 'payment.status': 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$payment.amount' } } }
    ]);
    const lastMonthRevenue = lastMonthRevenueData[0]?.total || 1;
    const revenueTrend = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;
    
    // User growth
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    const usersLastMonth = await User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } });
    const userGrowthTrend = usersLastMonth > 0 ? Math.round(((newUsersThisMonth - usersLastMonth) / usersLastMonth) * 100) : 0;
    
    // Booking metrics
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const conversionRate = totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0;
    
    // Average ticket size
    const avgTicketData = await Booking.aggregate([
      { $match: { status: 'completed', 'payment.status': 'paid' } },
      { $group: { _id: null, avg: { $avg: '$payment.amount' } } }
    ]);
    const avgTicketSize = Math.round(avgTicketData[0]?.avg || 0);
    
    // Booking status breakdown
    const statusBreakdown = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Top services by booking count
    const topServices = await Booking.aggregate([
      { $group: { 
        _id: '$subServiceId', 
        count: { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ['$payment.status', 'paid'] }, '$payment.amount', 0] } }
      }},
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'subservices',
        localField: '_id',
        foreignField: '_id',
        as: 'service'
      }},
      { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } }
    ]);
    
    // Technician stats
    const technicianCount = await User.countDocuments({ role: 'technician' });
    const availableTechnicians = await User.countDocuments({ role: 'technician', isVerified: true });
    const technicianAvailability = technicianCount > 0 ? Math.round((availableTechnicians / technicianCount) * 100) : 0;
    
    // Monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: 'completed', 'payment.status': 'paid', createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        total: { $sum: '$payment.amount' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue,
          thisMonth: thisMonthRevenue,
          trend: revenueTrend
        },
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth,
          trend: userGrowthTrend
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          conversionRate: parseFloat(conversionRate),
          avgTicketSize,
          statusBreakdown
        },
        topServices: topServices.map(s => ({
          name: s.service?.name || 'Unknown Service',
          count: s.count,
          revenue: s.revenue
        })),
        technicianAvailability,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};
// @desc    Create a new user (Admin)
// @route   POST /api/admin/users
// @access  Private (Admin)
exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      isVerified: true, // Auto-verify admin-created users
    });

    // If technician, create profile
    if (role === 'technician') {
      const TechnicianProfile = require('../models/TechnicianProfile');
      await TechnicianProfile.create({
        userId: user._id,
        serviceCategory: 'electronics', // Default
      });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message,
    });
  }
};
