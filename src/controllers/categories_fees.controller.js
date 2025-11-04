const CategoriesFees = require('../models/categories_fees.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new categories fees
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCategoriesFees = asyncHandler(async (req, res) => {
  try {
    const categoriesFeesData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const categoriesFees = await CategoriesFees.create(categoriesFeesData);
    sendSuccess(res, categoriesFees, 'Categories Fees created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all categories fees with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCategoriesFees = asyncHandler(async (req, res) => {
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
      filter.categoryName = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [categoriesFees, total] = await Promise.all([
      CategoriesFees.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      CategoriesFees.countDocuments(filter)
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
    sendPaginated(res, categoriesFees, pagination, 'Categories Fees retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get categories fees by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCategoriesFeesById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const categoriesFees = await CategoriesFees.findOne({ categories_fees_id: parseInt(id) });

    if (!categoriesFees) {
      return sendNotFound(res, 'Categories Fees not found');
    }
    sendSuccess(res, categoriesFees, 'Categories Fees retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update categories fees by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCategoriesFees = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const categoriesFees = await CategoriesFees.findOneAndUpdate(
      { categories_fees_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!categoriesFees) {
      return sendNotFound(res, 'Categories Fees not found');
    }
    sendSuccess(res, categoriesFees, 'Categories Fees updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete categories fees by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCategoriesFees = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const categoriesFees = await CategoriesFees.findOneAndUpdate(
      { categories_fees_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!categoriesFees) {
      return sendNotFound(res, 'Categories Fees not found');
    }
    sendSuccess(res, categoriesFees, 'Categories Fees deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createCategoriesFees,
  getAllCategoriesFees,
  getCategoriesFeesById,
  updateCategoriesFees,
  deleteCategoriesFees
};

