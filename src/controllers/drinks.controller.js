const Drinks = require('../models/drinks.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new drinks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createDrinks = asyncHandler(async (req, res) => {
  try {
    const drinksData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const drinks = await Drinks.create(drinksData);

    logger.info('Drinks created successfully', { drinksId: drinks._id, drinks_id: drinks.drinks_id });

    sendSuccess(res, drinks, 'Drinks created successfully', 201);
  } catch (error) {
    logger.error('Error creating drinks', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all drinks with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllDrinks = asyncHandler(async (req, res) => {
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
        { drinks_name: { $regex: search, $options: 'i' } },
        { brand_name: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [drinks, total] = await Promise.all([
      Drinks.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Drinks.countDocuments(filter)
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

    logger.info('Drinks retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });

    sendPaginated(res, drinks, pagination, 'Drinks retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving drinks', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get drinks by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDrinksById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const drinks = await Drinks.findOne({ drinks_id: parseInt(id) });

    if (!drinks) {
      return sendNotFound(res, 'Drinks not found');
    }

    logger.info('Drinks retrieved successfully', { drinksId: drinks._id });

    sendSuccess(res, drinks, 'Drinks retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving drinks', { error: error.message, drinksId: req.params.id });
    throw error;
  }
});

/**
 * Update drinks by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateDrinks = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const drinks = await Drinks.findOneAndUpdate(
      { drinks_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!drinks) {
      return sendNotFound(res, 'Drinks not found');
    }

    logger.info('Drinks updated successfully', { drinksId: drinks._id });

    sendSuccess(res, drinks, 'Drinks updated successfully');
  } catch (error) {
    logger.error('Error updating drinks', { error: error.message });
    throw error;
  }
});

/**
 * Delete drinks by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteDrinks = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const drinks = await Drinks.findOneAndUpdate(
      { drinks_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!drinks) {
      return sendNotFound(res, 'Drinks not found');
    }

    logger.info('Drinks deleted successfully', { drinksId: drinks._id });

    sendSuccess(res, drinks, 'Drinks deleted successfully');
  } catch (error) {
    logger.error('Error deleting drinks', { error: error.message, drinksId: req.params.id });
    throw error;
  }
});

/**
 * Get drinks created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDrinksByAuth = asyncHandler(async (req, res) => {
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
        { drinks_name: { $regex: search, $options: 'i' } },
        { brand_name: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [drinks, total] = await Promise.all([
      Drinks.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Drinks.countDocuments(filter)
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

    logger.info('User drinks retrieved successfully', { userId: req.userId, total, page: parseInt(page), limit: parseInt(limit) });

    sendPaginated(res, drinks, pagination, 'User drinks retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving user drinks', { error: error.message, userId: req.userId });
    throw error;
  }
});

module.exports = {
  createDrinks,
  getAllDrinks,
  getDrinksById,
  updateDrinks,
  deleteDrinks,
  getDrinksByAuth
};

