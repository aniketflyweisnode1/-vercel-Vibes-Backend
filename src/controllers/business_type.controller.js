const BusinessType = require('../models/business_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new business type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createBusinessType = asyncHandler(async (req, res) => {
  try {
    // Create business type data
    const businessTypeData = {
      ...req.body,
      created_by: req.userId || null
    };

    // Create business type
    const businessType = await BusinessType.create(businessTypeData);

    logger.info('Business type created successfully', { 
      businessTypeId: businessType._id, 
      business_type_id: businessType.business_type_id 
    });

    sendSuccess(res, businessType, 'Business type created successfully', 201);
  } catch (error) {
    logger.error('Error creating business type', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all business types with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllBusinessTypes = asyncHandler(async (req, res) => {
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
        { business_type: { $regex: search, $options: 'i' } }
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
    const [businessTypes, total] = await Promise.all([
      BusinessType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      BusinessType.countDocuments(filter)
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

    logger.info('Business types retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, businessTypes, pagination, 'Business types retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving business types', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get business type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBusinessTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const businessType = await BusinessType.findOne({ business_type_id: parseInt(id) });

    if (!businessType) {
      return sendNotFound(res, 'Business type not found');
    }

    logger.info('Business type retrieved successfully', { businessTypeId: businessType._id });

    sendSuccess(res, businessType, 'Business type retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving business type', { error: error.message, businessTypeId: req.params.id });
    throw error;
  }
});

/**
 * Update business type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateBusinessType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const businessType = await BusinessType.findOneAndUpdate(
      { business_type_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!businessType) {
      return sendNotFound(res, 'Business type not found');
    }

    logger.info('Business type updated successfully', { businessTypeId: businessType._id });

    sendSuccess(res, businessType, 'Business type updated successfully');
  } catch (error) {
    logger.error('Error updating business type', { error: error.message, businessTypeId: req.params.id });
    throw error;
  }
});

/**
 * Update business type by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateBusinessTypeByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const businessType = await BusinessType.findOneAndUpdate(
      { business_type_id: parseInt(id) },
      finalUpdateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!businessType) {
      return sendNotFound(res, 'Business type not found');
    }

    logger.info('Business type updated successfully by ID in body', { 
      businessTypeId: businessType._id, 
      updatedBy: req.userId 
    });

    sendSuccess(res, businessType, 'Business type updated successfully');
  } catch (error) {
    logger.error('Error updating business type by ID in body', { 
      error: error.message, 
      businessTypeId: req.body.id 
    });
    throw error;
  }
});

/**
 * Delete business type by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteBusinessType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const businessType = await BusinessType.findOneAndUpdate(
      { business_type_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!businessType) {
      return sendNotFound(res, 'Business type not found');
    }

    logger.info('Business type deleted successfully', { businessTypeId: businessType._id });

    sendSuccess(res, businessType, 'Business type deleted successfully');
  } catch (error) {
    logger.error('Error deleting business type', { error: error.message, businessTypeId: req.params.id });
    throw error;
  }
});

/**
 * Get business types by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBusinessTypesByAuth = asyncHandler(async (req, res) => {
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
        { business_type: { $regex: search, $options: 'i' } }
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
    const [businessTypes, total] = await Promise.all([
      BusinessType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      BusinessType.countDocuments(filter)
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

    logger.info('Business types retrieved by auth successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit),
      userId: req.userId
    });

    sendPaginated(res, businessTypes, pagination, 'Business types retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving business types by auth', { 
      error: error.message, 
      userId: req.userId 
    });
    throw error;
  }
});

module.exports = {
  createBusinessType,
  getAllBusinessTypes,
  getBusinessTypeById,
  updateBusinessType,
  updateBusinessTypeByIdBody,
  deleteBusinessType,
  getBusinessTypesByAuth
};
