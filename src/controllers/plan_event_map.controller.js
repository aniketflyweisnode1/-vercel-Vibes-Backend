const PlanEventMap = require('../models/plan_event_map.model');
const Transaction = require('../models/transaction.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new plan event map
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPlanEventMap = asyncHandler(async (req, res) => {
  try {
    // Create transaction first
    const transactionData = {
      user_id: req.userId,
      amount: req.body.amount || 0, // Amount from request body or default to 0
      payment_method_id: req.body.payment_method_id || 1, // Default payment method
      transactionType: 'EventPayment',
      created_by: req.userId
    };

    const transaction = await Transaction.create(transactionData);

    // Create plan event map data with the transaction ID
    const planEventMapData = {
      ...req.body,
      transaction_id: transaction.transaction_id,
      createdBy: req.userId
    };

    // Create plan event map
    const planEventMap = await PlanEventMap.create(planEventMapData);

    // Return both plan event map and transaction info
    const responseData = {
      planEventMap,
      transaction: {
        transaction_id: transaction.transaction_id,
        amount: transaction.amount,
        status: transaction.status,
        transactionType: transaction.transactionType
      }
    };

    sendSuccess(res, responseData, 'Plan event map and transaction created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all plan event maps with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllPlanEventMaps = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, event_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (status !== undefined) {
      filter.status = status === 'true';
    }
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }

    // Get plan event maps with pagination
    const [planEventMaps, total] = await Promise.all([
      PlanEventMap.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PlanEventMap.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, planEventMaps, pagination, 'Plan event maps retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get plan event map by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPlanEventMapById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const planEventMap = await PlanEventMap.findOne({ plan_event_id: parseInt(id) });

    if (!planEventMap) {
      return sendNotFound(res, 'Plan event map not found');
    }

    sendSuccess(res, planEventMap, 'Plan event map retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get plan event maps by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPlanEventMapsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, event_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { createdBy: req.userId };
    if (status !== undefined) {
      filter.status = status === 'true';
    }
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }

    // Get plan event maps with pagination
    const [planEventMaps, total] = await Promise.all([
      PlanEventMap.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PlanEventMap.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, planEventMaps, pagination, 'User plan event maps retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get plan event maps by event ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPlanEventMapsByEventId = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { event_id: parseInt(eventId) };
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Get plan event maps with pagination
    const [planEventMaps, total] = await Promise.all([
      PlanEventMap.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PlanEventMap.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, planEventMaps, pagination, 'Plan event maps by event retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update plan event map
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePlanEventMap = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    const planEventMap = await PlanEventMap.findOneAndUpdate(
      { plan_event_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!planEventMap) {
      return sendNotFound(res, 'Plan event map not found');
    }

    sendSuccess(res, planEventMap, 'Plan event map updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update event payment status after transaction completion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventPayment = asyncHandler(async (req, res) => {
  try {
    const { transaction_id } = req.body;

// payment status get status from transaction

    // Find the transaction
    const transaction = await Transaction.findOne({ transaction_id: parseInt(transaction_id) });
    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }


    // Find the plan event map by transaction_id
    const planEventMap = await PlanEventMap.findOne({ transaction_id: transaction_id });
    if (!planEventMap) {
      return sendNotFound(res, 'Plan event map not found for this transaction');
    }

    // Prepare update data
    const updateData = {
      payment_status: transaction.status === 'completed' ? 'completed' : 
                     transaction.status === 'failed' ? 'failed' : 
                     transaction.status === 'refunded' ? 'refunded' : 'pending',
      updatedBy: req.userId,
      updatedAt: new Date()
    };

    // Update the plan event map
    const updatedPlanEventMap = await PlanEventMap.findOneAndUpdate(
      { plan_event_id: planEventMap.plan_event_id },
      updateData,
      { new: true, runValidators: true }
    );

    sendSuccess(res, updatedPlanEventMap, 'Event payment status updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete plan event map
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deletePlanEventMap = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const planEventMap = await PlanEventMap.findOneAndDelete({ plan_event_id: parseInt(id) });

    if (!planEventMap) {
      return sendNotFound(res, 'Plan event map not found');
    }

    sendSuccess(res, null, 'Plan event map deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createPlanEventMap,
  getAllPlanEventMaps,
  getPlanEventMapById,
  getPlanEventMapsByAuth,
  getPlanEventMapsByEventId,
  updatePlanEventMap,
  updateEventPayment,
  deletePlanEventMap
};
