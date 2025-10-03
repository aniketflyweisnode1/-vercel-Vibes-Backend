const DressCode = require('../models/dress_code.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new dress code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createDressCode = asyncHandler(async (req, res) => {
  try {
    const dressCodeData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const dressCode = await DressCode.create(dressCodeData);

    logger.info('Dress Code created successfully', { dressCodeId: dressCode._id, dress_code_id: dressCode.dress_code_id });

    sendSuccess(res, dressCode, 'Dress Code created successfully', 201);
  } catch (error) {
    logger.error('Error creating dress code', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all dress codes with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllDressCode = asyncHandler(async (req, res) => {
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
      filter.dress_code_name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [dressCode, total] = await Promise.all([
      DressCode.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      DressCode.countDocuments(filter)
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

    logger.info('Dress Code retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });

    sendPaginated(res, dressCode, pagination, 'Dress Code retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving dress code', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get dress code by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDressCodeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const dressCode = await DressCode.findOne({ dress_code_id: parseInt(id) });

    if (!dressCode) {
      return sendNotFound(res, 'Dress Code not found');
    }

    logger.info('Dress Code retrieved successfully', { dressCodeId: dressCode._id });

    sendSuccess(res, dressCode, 'Dress Code retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving dress code', { error: error.message, dressCodeId: req.params.id });
    throw error;
  }
});

/**
 * Update dress code by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateDressCode = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const dressCode = await DressCode.findOneAndUpdate(
      { dress_code_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!dressCode) {
      return sendNotFound(res, 'Dress Code not found');
    }

    logger.info('Dress Code updated successfully', { dressCodeId: dressCode._id });

    sendSuccess(res, dressCode, 'Dress Code updated successfully');
  } catch (error) {
    logger.error('Error updating dress code', { error: error.message });
    throw error;
  }
});

/**
 * Delete dress code by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteDressCode = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const dressCode = await DressCode.findOneAndUpdate(
      { dress_code_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!dressCode) {
      return sendNotFound(res, 'Dress Code not found');
    }

    logger.info('Dress Code deleted successfully', { dressCodeId: dressCode._id });

    sendSuccess(res, dressCode, 'Dress Code deleted successfully');
  } catch (error) {
    logger.error('Error deleting dress code', { error: error.message, dressCodeId: req.params.id });
    throw error;
  }
});

/**
 * Get dress code created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDressCodeByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {
      created_by: req.userId
    };

    if (search) {
      filter.dress_code_name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [dressCode, total] = await Promise.all([
      DressCode.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      DressCode.countDocuments(filter)
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

    logger.info('User dress code retrieved successfully', { userId: req.userId, total, page: parseInt(page), limit: parseInt(limit) });

    sendPaginated(res, dressCode, pagination, 'User dress code retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving user dress code', { error: error.message, userId: req.userId });
    throw error;
  }
});

module.exports = {
  createDressCode,
  getAllDressCode,
  getDressCodeById,
  updateDressCode,
  deleteDressCode,
  getDressCodeByAuth
};

