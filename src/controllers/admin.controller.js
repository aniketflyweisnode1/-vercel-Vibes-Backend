const User = require('../models/user.model');
const Event = require('../models/event.model');
const MarketPlaceServiceCharges = require('../models/marketplace_service_charges.model');
const VibesCardStudio = require('../models/vibescard_studio.model');
const { generateTokens } = require('../../utils/jwt');
const { sendSuccess, sendError, sendUnauthorized } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Admin login with email and password (no OTP)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const adminLogin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Check if user is active
    if (!user.status) {
      return sendError(res, 'Account is deactivated', 401);
    }

    // Check if user is admin (role_id should be admin role, adjust based on your role system)
    // Assuming role_id 1 or 2 is admin - adjust this based on your actual admin role_id
    if (![1, 2].includes(user.role_id)) {
      return sendUnauthorized(res, 'Unauthorized: Admin access only');
    }

    // Compare password (plain text comparison since your system uses plain text passwords)
    if (user.password !== password) {
      return sendUnauthorized(res, 'Invalid email or password');
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Remove password from user object
    const userResponse = user.toObject();
    delete userResponse.password;

    sendSuccess(res, {
      user: userResponse,
      ...tokens
    }, 'Admin login successful');
  } catch (error) {
    throw error;
  }
});

/**
 * Get admin profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAdminProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.userId }).select('-password');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check if user is admin
    if (![1, 2].includes(user.role_id)) {
      return sendUnauthorized(res, 'Unauthorized: Admin access only');
    }

    sendSuccess(res, user, 'Admin profile retrieved successfully');
  } catch (error) {
    throw error;
  }
});
const getAdminDashboard = asyncHandler(async (req, res) => {
  try {
    const [totalEventTemplates, activeUsers, totalEvents, avgRatingResult] = await Promise.all([
      VibesCardStudio.countDocuments({ status: true }),
      User.countDocuments({ status: true }),
      Event.countDocuments({ status: true }),
      User.aggregate([{ $match: { rating: { $exists: true, $ne: null } } }, { $group: { _id: null, avgRating: { $avg: '$rating' } } }])
    ]);
    const dashboardData = {
      eventTemplates: totalEventTemplates || 0,
      activeUsers: activeUsers || 0,
      eventsCreated: totalEvents || 0,
      averageRating: avgRatingResult.length ? Number(avgRatingResult[0].avgRating.toFixed(1)) : 0
    };
    sendSuccess(res, dashboardData, 'Admin dashboard data retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  adminLogin,
  getAdminProfile,
  getAdminDashboard
};

