const ItemCategory = require('../models/item_category.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new item category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createItemCategory = asyncHandler(async (req, res) => {
  try {
    // Create item category data
    const itemCategoryData = {
      ...req.body,
      createdBy: req.userId
    };

    // Create item category
    const itemCategory = await ItemCategory.create(itemCategoryData);

    sendSuccess(res, itemCategory, 'Item category created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all item categories with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllItemCategories = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { categorytxt: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Get item categories with pagination
    const [itemCategories, total] = await Promise.all([
      ItemCategory.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ItemCategory.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, itemCategories, pagination, 'Item categories retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get item category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getItemCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const itemCategory = await ItemCategory.findOne({ item_category_id: parseInt(id) });

    if (!itemCategory) {
      return sendNotFound(res, 'Item category not found');
    }

    sendSuccess(res, itemCategory, 'Item category retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get item categories by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getItemCategoriesByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { createdBy: req.userId };
    if (search) {
      filter.$or = [
        { categorytxt: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Get item categories with pagination
    const [itemCategories, total] = await Promise.all([
      ItemCategory.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ItemCategory.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, itemCategories, pagination, 'User item categories retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update item category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateItemCategory = asyncHandler(async (req, res) => {
  try {

    const { id } = req.body;
    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    const itemCategory = await ItemCategory.findOneAndUpdate(
      { item_category_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!itemCategory) {
      return sendNotFound(res, 'Item category not found');
    }

    sendSuccess(res, itemCategory, 'Item category updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete item category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteItemCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const itemCategory = await ItemCategory.findOneAndDelete({ item_category_id: parseInt(id) });

    if (!itemCategory) {
      return sendNotFound(res, 'Item category not found');
    }

    sendSuccess(res, null, 'Item category deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createItemCategory,
  getAllItemCategories,
  getItemCategoryById,
  getItemCategoriesByAuth,
  updateItemCategory,
  deleteItemCategory
};
