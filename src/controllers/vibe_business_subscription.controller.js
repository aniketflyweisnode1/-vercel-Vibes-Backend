const VibeBusinessSubscription = require('../models/vibe_business_subscription.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new vibe business subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVibeBusinessSubscription = asyncHandler(async (req, res) => {
  try {
    // Create vibe business subscription data
    const subscriptionData = {
      ...req.body,
      createdBy: req.userId
    };

    // Create vibe business subscription
    const subscription = await VibeBusinessSubscription.create(subscriptionData);

    sendSuccess(res, subscription, 'Vibe business subscription created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all vibe business subscriptions with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVibeBusinessSubscriptions = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, planDuration } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { plan_name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }
    if (planDuration) {
      filter.planDuration = planDuration;
    }

    // Get vibe business subscriptions with pagination
    const [subscriptions, total] = await Promise.all([
      VibeBusinessSubscription.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VibeBusinessSubscription.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, subscriptions, pagination, 'Vibe business subscriptions retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vibe business subscription by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVibesBusinessSubscriptionById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await VibeBusinessSubscription.findOne({ plan_id: parseInt(id) });

    if (!subscription) {
      return sendNotFound(res, 'Vibe business subscription not found');
    }

    sendSuccess(res, subscription, 'Vibe business subscription retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vibe business subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVibeBusinessSubscription = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    const subscription = await VibeBusinessSubscription.findOneAndUpdate(
      { plan_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!subscription) {
      return sendNotFound(res, 'Vibe business subscription not found');
    }

    sendSuccess(res, subscription, 'Vibe business subscription updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete vibe business subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVibeBusinessSubscription = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await VibeBusinessSubscription.findOneAndDelete({ plan_id: parseInt(id) });

    if (!subscription) {
      return sendNotFound(res, 'Vibe business subscription not found');
    }

    sendSuccess(res, null, 'Vibe business subscription deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createVibeBusinessSubscription,
  getAllVibeBusinessSubscriptions,
  getVibesBusinessSubscriptionById,
  updateVibeBusinessSubscription,
  deleteVibeBusinessSubscription
};
