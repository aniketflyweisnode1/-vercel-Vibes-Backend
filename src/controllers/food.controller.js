const Food = require('../models/food.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new food
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createFood = asyncHandler(async (req, res) => {
  try {
    const foodData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const food = await Food.create(foodData);
    sendSuccess(res, food, 'Food created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all food with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllFood = asyncHandler(async (req, res) => {
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
        { food_name: { $regex: search, $options: 'i' } },
        { brand_name: { $regex: search, $options: 'i' } },
        { food_type: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.status =  'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [food, total] = await Promise.all([
      Food.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Food.countDocuments(filter)
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
    sendPaginated(res, food, pagination, 'Food retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get food by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFoodById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const food = await Food.findOne({ food_id: parseInt(id) });

    if (!food) {
      return sendNotFound(res, 'Food not found');
    }
    sendSuccess(res, food, 'Food retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update food by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateFood = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const food = await Food.findOneAndUpdate(
      { food_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!food) {
      return sendNotFound(res, 'Food not found');
    }
    sendSuccess(res, food, 'Food updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete food by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteFood = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const food = await Food.findOneAndUpdate(
      { food_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!food) {
      return sendNotFound(res, 'Food not found');
    }
    sendSuccess(res, food, 'Food deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get food created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFoodByAuth = asyncHandler(async (req, res) => {
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
        { food_name: { $regex: search, $options: 'i' } },
        { brand_name: { $regex: search, $options: 'i' } },
        { food_type: { $regex: search, $options: 'i' } }
      ];
    }

  

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [food, total] = await Promise.all([
      Food.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Food.countDocuments(filter)
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
    sendPaginated(res, food, pagination, 'User food retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createFood,
  getAllFood,
  getFoodById,
  updateFood,
  deleteFood,
  getFoodByAuth
};

