const Decorations = require('../models/decorations.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new decorations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createDecorations = asyncHandler(async (req, res) => {
  try {
    const decorationsData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const decorations = await Decorations.create(decorationsData);
    sendSuccess(res, decorations, 'Decorations created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all decorations with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllDecorations = asyncHandler(async (req, res) => {
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
      filter.$or = [
        { decorations_name: { $regex: search, $options: 'i' } },
        { brand_name: { $regex: search, $options: 'i' } },
        { decorations_type: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [decorations, total] = await Promise.all([
      Decorations.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Decorations.countDocuments(filter)
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
    sendPaginated(res, decorations, pagination, 'Decorations retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get decorations by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDecorationsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const decorations = await Decorations.findOne({ decorations_id: parseInt(id) });

    if (!decorations) {
      return sendNotFound(res, 'Decorations not found');
    }
    sendSuccess(res, decorations, 'Decorations retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update decorations by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateDecorations = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const decorations = await Decorations.findOneAndUpdate(
      { decorations_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!decorations) {
      return sendNotFound(res, 'Decorations not found');
    }
    sendSuccess(res, decorations, 'Decorations updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete decorations by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteDecorations = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const decorations = await Decorations.findOneAndUpdate(
      { decorations_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!decorations) {
      return sendNotFound(res, 'Decorations not found');
    }
    sendSuccess(res, decorations, 'Decorations deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get decorations created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDecorationsByAuth = asyncHandler(async (req, res) => {
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
      filter.$or = [
        { decorations_name: { $regex: search, $options: 'i' } },
        { brand_name: { $regex: search, $options: 'i' } },
        { decorations_type: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [decorations, total] = await Promise.all([
      Decorations.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Decorations.countDocuments(filter)
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
    sendPaginated(res, decorations, pagination, 'User decorations retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createDecorations,
  getAllDecorations,
  getDecorationsById,
  updateDecorations,
  deleteDecorations,
  getDecorationsByAuth
};

