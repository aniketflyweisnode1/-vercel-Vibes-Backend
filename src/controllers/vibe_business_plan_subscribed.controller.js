const VibeBusinessPlanSubscribed = require('../models/vibe_business_plan_subscribed.model');
const VibeBusinessSubscription = require('../models/vibe_business_subscription.model');
const Transaction = require('../models/transaction.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new vibe business plan subscribed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVibeBusinessPlanSubscribed = asyncHandler(async (req, res) => {
  try {
    // Get plan details first
    const plan = await VibeBusinessSubscription.findOne({ plan_id: parseInt(req.body.plan_id) });
    if (!plan) {
      return sendError(res, 'Subscription plan not found', 404);
    }

    let transactionId = req.body.transaction_id;

    // If no transaction_id is provided, create a new transaction automatically
    if (!transactionId) {
      // Create a new transaction for Package_Buy
      const transactionData = {
        user_id: req.userId,
        amount: plan.price,
        status: 'completed', // Auto-complete the transaction
        payment_method_id: req.body.payment_method_id || null, // Optional payment method
        transactionType: 'Package_Buy',
        transaction_date: new Date(),
        reference_number: `PLAN_${plan.plan_id}_${Date.now()}`,
        created_by: req.userId
      };

      const newTransaction = await Transaction.create(transactionData);
      transactionId = newTransaction.transaction_id;
    } else {
      // If transaction_id is provided, validate it
      const transaction = await Transaction.findOne({ transaction_id: parseInt(transactionId) });
      if (!transaction) {
        return sendError(res, 'Transaction not found', 404);
      }
      if (transaction.transactionType !== 'Package_Buy') {
        return sendError(res, 'Transaction must be of type Package_Buy', 400);
      }
      if (transaction.status !== 'completed') {
        return sendError(res, 'Transaction must be completed', 400);
      }
    }

    // Create vibe business plan subscribed data
    const planSubscribedData = {
      ...req.body,
      transaction_id: transactionId,
      transaction_status: 'completed', // Auto-set as completed
      createdBy: req.userId
    };

    // Set start_plan_date and calculate end_plan_date
    planSubscribedData.start_plan_date = new Date();
    
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    if (plan.planDuration === 'Monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.planDuration === 'Annually') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    planSubscribedData.end_plan_date = endDate;

    // Create vibe business plan subscribed
    const planSubscribed = await VibeBusinessPlanSubscribed.create(planSubscribedData);

    sendSuccess(res, planSubscribed, 'Vibe business plan subscribed created successfully with auto-generated transaction', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all vibe business plans subscribed with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVibeBusinessPlansSubscribed = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, transaction_status, user_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { transaction_status: { $regex: search, $options: 'i' } }
      ];
    }
  
    if (transaction_status) {
      filter.transaction_status = transaction_status;
    }
    if (user_id) {
      filter.user_id = user_id;
    }

    // Get vibe business plans subscribed with pagination
    const [plansSubscribed, total] = await Promise.all([
      VibeBusinessPlanSubscribed.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VibeBusinessPlanSubscribed.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, plansSubscribed, pagination, 'Vibe business plans subscribed retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vibe business plan subscribed by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVibeBusinessPlanSubscribedById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const planSubscribed = await VibeBusinessPlanSubscribed.findOne({ vibe_business_plan_subscribed_id: parseInt(id) });

    if (!planSubscribed) {
      return sendNotFound(res, 'Vibe business plan subscribed not found');
    }

    sendSuccess(res, planSubscribed, 'Vibe business plan subscribed retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vibe business plan subscribed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVibeBusinessPlanSubscribed = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    // Get the existing plan subscribed to check current plan_id
    const existingPlanSubscribed = await VibeBusinessPlanSubscribed.findOne({ vibe_business_plan_subscribed_id: parseInt(id) });
    if (!existingPlanSubscribed) {
      return sendNotFound(res, 'Vibe business plan subscribed not found');
    }

    const planId = req.body.plan_id || existingPlanSubscribed.plan_id;
    const plan = await VibeBusinessSubscription.findOne({ plan_id: parseInt(planId) });
    if (!plan) {
      return sendError(res, 'Subscription plan not found', 404);
    }

    // If transaction_id is provided, validate it exists
    if (req.body.transaction_id) {
      const transaction = await Transaction.findOne({ transaction_id: parseInt(req.body.transaction_id) });
      if (!transaction) {
        return sendError(res, 'Transaction not found', 404);
      }
      req.body.transaction_status = transaction.status;
    }

    // Remove id from req.body before updating
    const { id: _, ...updateData } = req.body;
    
    const planSubscribed = await VibeBusinessPlanSubscribed.findOneAndUpdate(
      { vibe_business_plan_subscribed_id: parseInt(id) },
      updateData,
      { new: true, runValidators: true }
    );

    if (!planSubscribed) {
      return sendNotFound(res, 'Vibe business plan subscribed not found');
    }

    sendSuccess(res, planSubscribed, 'Vibe business plan subscribed updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vibe business plan subscribed after transaction completion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAfterTransaction = asyncHandler(async (req, res) => {
  try {
    const { transaction_id } = req.body;

    // Find the transaction
    const transaction = await Transaction.findOne({ transaction_id: parseInt(transaction_id) });
    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }

    // Find the plan subscribed by transaction_id
    const planSubscribed = await VibeBusinessPlanSubscribed.findOne({ transaction_id: parseInt(transaction_id) });
    if (!planSubscribed) {
      return sendNotFound(res, 'Vibe business plan subscribed not found for this transaction');
    }

    // Get the subscription plan details
    const subscriptionPlan = await VibeBusinessSubscription.findOne({ plan_id: parseInt(planSubscribed.plan_id) });
    if (!subscriptionPlan) {
      return sendError(res, 'Subscription plan not found', 404);
    }

    // Prepare update data
    const updateData = {
      transaction_status: transaction.status,
      updatedBy: req.userId,
      updatedAt: new Date()
    };

    // If transaction is completed, update dates
    if (transaction.status === 'completed') {
      updateData.start_plan_date = new Date();
      
      // Calculate end date based on plan duration
      const startDate = new Date();
      const endDate = new Date(startDate);
      
      if (subscriptionPlan.planDuration === 'Monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (subscriptionPlan.planDuration === 'Annually') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      updateData.end_plan_date = endDate;
    }

    // Update the plan subscribed
    const updatedPlanSubscribed = await VibeBusinessPlanSubscribed.findOneAndUpdate(
      { vibe_business_plan_subscribed_id: planSubscribed.vibe_business_plan_subscribed_id },
      updateData,
      { new: true, runValidators: true }
    );

    sendSuccess(res, updatedPlanSubscribed, 'Vibe business plan subscribed updated after transaction completion');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete vibe business plan subscribed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVibeBusinessPlanSubscribed = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const planSubscribed = await VibeBusinessPlanSubscribed.findOneAndDelete({ vibe_business_plan_subscribed_id: parseInt(id) });

    if (!planSubscribed) {
      return sendNotFound(res, 'Vibe business plan subscribed not found');
    }

    sendSuccess(res, null, 'Vibe business plan subscribed deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createVibeBusinessPlanSubscribed,
  getAllVibeBusinessPlansSubscribed,
  getVibeBusinessPlanSubscribedById,
  updateVibeBusinessPlanSubscribed,
  updateAfterTransaction,
  deleteVibeBusinessPlanSubscribed
};
