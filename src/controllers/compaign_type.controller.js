const CompaignType = require('../models/compaign_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new compaign type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCompaignType = asyncHandler(async (req, res) => {
  try {
    const compaignTypeData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const compaignType = await CompaignType.create(compaignTypeData);

    logger.info('Compaign Type created successfully', { 
      compaignTypeId: compaignType._id, 
      compaign_type_id: compaignType.compaign_type_id 
    });

    sendSuccess(res, compaignType, 'Compaign Type created successfully', 201);
  } catch (error) {
    logger.error('Error creating compaign type', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all compaign types with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCompaignType = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [compaignTypes, total] = await Promise.all([
      CompaignType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      CompaignType.countDocuments(filter)
    ]);

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

    logger.info('Compaign Types retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, compaignTypes, pagination, 'Compaign Types retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving compaign types', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get compaign type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCompaignTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const compaignType = await CompaignType.findOne({ compaign_type_id: parseInt(id) });

    if (!compaignType) {
      return sendNotFound(res, 'Compaign Type not found');
    }

    logger.info('Compaign Type retrieved successfully', { compaignTypeId: compaignType._id });

    sendSuccess(res, compaignType, 'Compaign Type retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving compaign type', { 
      error: error.message, 
      compaignTypeId: req.params.id 
    });
    throw error;
  }
});

/**
 * Update compaign type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCompaignType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const compaignType = await CompaignType.findOneAndUpdate(
      { compaign_type_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!compaignType) {
      return sendNotFound(res, 'Compaign Type not found');
    }

    logger.info('Compaign Type updated successfully', { compaignTypeId: compaignType._id });

    sendSuccess(res, compaignType, 'Compaign Type updated successfully');
  } catch (error) {
    logger.error('Error updating compaign type', { error: error.message });
    throw error;
  }
});

/**
 * Delete compaign type by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCompaignType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const compaignType = await CompaignType.findOneAndUpdate(
      { compaign_type_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!compaignType) {
      return sendNotFound(res, 'Compaign Type not found');
    }

    logger.info('Compaign Type deleted successfully', { compaignTypeId: compaignType._id });

    sendSuccess(res, compaignType, 'Compaign Type deleted successfully');
  } catch (error) {
    logger.error('Error deleting compaign type', { 
      error: error.message, 
      compaignTypeId: req.params.id 
    });
    throw error;
  }
});

module.exports = {
  createCompaignType,
  getAllCompaignType,
  getCompaignTypeById,
  updateCompaignType,
  deleteCompaignType
};

