const Items = require('../models/items.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createItem = asyncHandler(async (req, res) => {
  try {
    // Create item data
    const itemData = {
      ...req.body,
      createdBy: req.userId
    };

    // Create item
    const item = await Items.create(itemData);

    sendSuccess(res, item, 'Item created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all items with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllItems = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, item_Category_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { item_name: { $regex: search, $options: 'i' } },
        { item_brand: { $regex: search, $options: 'i' } },
        { item_color: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }
    if (item_Category_id) {
      filter.item_Category_id = parseInt(item_Category_id);
    }

    // Get items with pagination
    const [items, total] = await Promise.all([
      Items.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Items.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, items, pagination, 'Items retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get item by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getItemById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Items.findOne({ items_id: parseInt(id) });

    if (!item) {
      return sendNotFound(res, 'Item not found');
    }

    sendSuccess(res, item, 'Item retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get items by category ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getItemsByCategoryId = asyncHandler(async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { item_Category_id: categoryId };
    if (search) {
      filter.$or = [
        { item_name: { $regex: search, $options: 'i' } },
        { item_brand: { $regex: search, $options: 'i' } },
        { item_color: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Get items with pagination
    const [items, total] = await Promise.all([
      Items.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Items.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, items, pagination, 'Items by category retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    const item = await Items.findOneAndUpdate(
      { items_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) {
      return sendNotFound(res, 'Item not found');
    }

    sendSuccess(res, item, 'Item updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Items.findOneAndDelete({ items_id: parseInt(id) });

    if (!item) {
      return sendNotFound(res, 'Item not found');
    }

    sendSuccess(res, null, 'Item deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  getItemsByCategoryId,
  updateItem,
  deleteItem
};
