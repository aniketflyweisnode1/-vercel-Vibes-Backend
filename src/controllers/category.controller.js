const Category = require('../models/category.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

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
    sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error) {
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
    sendPaginated(res, categories, pagination, 'Categories retrieved successfully');
  } catch (error) {
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
    sendSuccess(res, category, 'Category retrieved successfully');
  } catch (error) {
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
    sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
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
    sendSuccess(res, category, 'Category deleted successfully');
  } catch (error) {
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
    sendPaginated(res, categories, pagination, 'User categories retrieved successfully');
  } catch (error) {
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

