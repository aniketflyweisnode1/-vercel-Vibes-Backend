const Category = require('../models/category.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCategory = asyncHandler(async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const category = await Category.create(categoryData);

    logger.info('Category created successfully', { categoryId: category._id, category_id: category.category_id });

    sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error) {
    logger.error('Error creating category', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all categories with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCategory = asyncHandler(async (req, res) => {
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
      filter.category_name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Category.countDocuments(filter)
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

    logger.info('Categories retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });

    sendPaginated(res, categories, pagination, 'Categories retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving categories', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({ category_id: parseInt(id) });

    if (!category) {
      return sendNotFound(res, 'Category not found');
    }

    logger.info('Category retrieved successfully', { categoryId: category._id });

    sendSuccess(res, category, 'Category retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving category', { error: error.message, categoryId: req.params.id });
    throw error;
  }
});

/**
 * Update category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const category = await Category.findOneAndUpdate(
      { category_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!category) {
      return sendNotFound(res, 'Category not found');
    }

    logger.info('Category updated successfully', { categoryId: category._id });

    sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    logger.error('Error updating category', { error: error.message });
    throw error;
  }
});

/**
 * Delete category by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOneAndUpdate(
      { category_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!category) {
      return sendNotFound(res, 'Category not found');
    }

    logger.info('Category deleted successfully', { categoryId: category._id });

    sendSuccess(res, category, 'Category deleted successfully');
  } catch (error) {
    logger.error('Error deleting category', { error: error.message, categoryId: req.params.id });
    throw error;
  }
});

/**
 * Get categories created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCategoryByAuth = asyncHandler(async (req, res) => {
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
      filter.category_name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Category.countDocuments(filter)
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

    logger.info('User categories retrieved successfully', { userId: req.userId, total, page: parseInt(page), limit: parseInt(limit) });

    sendPaginated(res, categories, pagination, 'User categories retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving user categories', { error: error.message, userId: req.userId });
    throw error;
  }
});

module.exports = {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryByAuth
};

