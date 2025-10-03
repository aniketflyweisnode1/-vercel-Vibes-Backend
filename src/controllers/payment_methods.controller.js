const PaymentMethods = require('../models/payment_methods.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new payment method
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPaymentMethod = asyncHandler(async (req, res) => {
  try {
    // Create payment method data
    const paymentMethodData = {
      ...req.body,
      created_by: req.userId || null
    };

    // Create payment method
    const paymentMethod = await PaymentMethods.create(paymentMethodData);

    logger.info('Payment method created successfully', { 
      paymentMethodId: paymentMethod._id, 
      payment_methods_id: paymentMethod.payment_methods_id 
    });

    sendSuccess(res, paymentMethod, 'Payment method created successfully', 201);
  } catch (error) {
    logger.error('Error creating payment method', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all payment methods with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllPaymentMethods = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { payment_method: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status == undefined) {
      filter.status = 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [paymentMethods, total] = await Promise.all([
      PaymentMethods.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      PaymentMethods.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    };

    logger.info('Payment methods retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, paymentMethods, pagination, 'Payment methods retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving payment methods', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get payment method by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPaymentMethodById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const paymentMethod = await PaymentMethods.findOne({ payment_methods_id: parseInt(id) });

    if (!paymentMethod) {
      return sendNotFound(res, 'Payment method not found');
    }

    logger.info('Payment method retrieved successfully', { paymentMethodId: paymentMethod._id });

    sendSuccess(res, paymentMethod, 'Payment method retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving payment method', { error: error.message, paymentMethodId: req.params.id });
    throw error;
  }
});

/**
 * Update payment method by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePaymentMethod = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const paymentMethod = await PaymentMethods.findOneAndUpdate(
      { payment_methods_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!paymentMethod) {
      return sendNotFound(res, 'Payment method not found');
    }

    logger.info('Payment method updated successfully', { paymentMethodId: paymentMethod._id });

    sendSuccess(res, paymentMethod, 'Payment method updated successfully');
  } catch (error) {
    logger.error('Error updating payment method', { error: error.message, paymentMethodId: req.params.id });
    throw error;
  }
});

/**
 * Update payment method by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePaymentMethodByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const paymentMethod = await PaymentMethods.findOneAndUpdate(
      { payment_methods_id: parseInt(id) },
      finalUpdateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!paymentMethod) {
      return sendNotFound(res, 'Payment method not found');
    }

    logger.info('Payment method updated successfully by ID in body', { 
      paymentMethodId: paymentMethod._id, 
      updatedBy: req.userId 
    });

    sendSuccess(res, paymentMethod, 'Payment method updated successfully');
  } catch (error) {
    logger.error('Error updating payment method by ID in body', { 
      error: error.message, 
      paymentMethodId: req.body.id 
    });
    throw error;
  }
});

/**
 * Delete payment method by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deletePaymentMethod = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const paymentMethod = await PaymentMethods.findOneAndUpdate(
      { payment_methods_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!paymentMethod) {
      return sendNotFound(res, 'Payment method not found');
    }

    logger.info('Payment method deleted successfully', { paymentMethodId: paymentMethod._id });

    sendSuccess(res, paymentMethod, 'Payment method deleted successfully');
  } catch (error) {
    logger.error('Error deleting payment method', { error: error.message, paymentMethodId: req.params.id });
    throw error;
  }
});

/**
 * Get payment methods by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPaymentMethodsByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {
      created_by: req.userId
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { payment_method: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [paymentMethods, total] = await Promise.all([
      PaymentMethods.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      PaymentMethods.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    };

    logger.info('Payment methods retrieved by auth successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit),
      userId: req.userId
    });

    sendPaginated(res, paymentMethods, pagination, 'Payment methods retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving payment methods by auth', { 
      error: error.message, 
        userId: req.userId 
    });
    throw error;
  }
});

module.exports = {
  createPaymentMethod,
  getAllPaymentMethods,
  getPaymentMethodById,
  updatePaymentMethod,
  updatePaymentMethodByIdBody,
  deletePaymentMethod,
  getPaymentMethodsByAuth
};
