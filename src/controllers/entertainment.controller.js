const Entertainment = require('../models/entertainment.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new entertainment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEntertainment = asyncHandler(async (req, res) => {
  try {
    const entertainmentData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const entertainment = await Entertainment.create(entertainmentData);
    sendSuccess(res, entertainment, 'Entertainment created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all entertainment with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEntertainment = asyncHandler(async (req, res) => {
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
        { entertainment_name: { $regex: search, $options: 'i' } },
        { brand_name: { $regex: search, $options: 'i' } },
        { entertainment_type: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [entertainment, total] = await Promise.all([
      Entertainment.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Entertainment.countDocuments(filter)
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
    sendPaginated(res, entertainment, pagination, 'Entertainment retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get entertainment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEntertainmentById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const entertainment = await Entertainment.findOne({ entertainment_id: parseInt(id) });

    if (!entertainment) {
      return sendNotFound(res, 'Entertainment not found');
    }
    sendSuccess(res, entertainment, 'Entertainment retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update entertainment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEntertainment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const entertainment = await Entertainment.findOneAndUpdate(
      { entertainment_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!entertainment) {
      return sendNotFound(res, 'Entertainment not found');
    }
    sendSuccess(res, entertainment, 'Entertainment updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete entertainment by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEntertainment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const entertainment = await Entertainment.findOneAndUpdate(
      { entertainment_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!entertainment) {
      return sendNotFound(res, 'Entertainment not found');
    }
    sendSuccess(res, entertainment, 'Entertainment deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get entertainment created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEntertainmentByAuth = asyncHandler(async (req, res) => {
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
        { entertainment_name: { $regex: search, $options: 'i' } },
        { brand_name: { $regex: search, $options: 'i' } },
        { entertainment_type: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [entertainment, total] = await Promise.all([
      Entertainment.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Entertainment.countDocuments(filter)
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
    sendPaginated(res, entertainment, pagination, 'User entertainment retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createEntertainment,
  getAllEntertainment,
  getEntertainmentById,
  updateEntertainment,
  deleteEntertainment,
  getEntertainmentByAuth
};

