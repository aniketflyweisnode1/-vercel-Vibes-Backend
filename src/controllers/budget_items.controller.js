const BudgetItems = require('../models/budget_items.model');
const Items = require('../models/items.model');
const ItemCategory = require('../models/item_category.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new budget items
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createBudgetItems = asyncHandler(async (req, res) => {
  try {
    // Create budget items data
    const budgetItemsData = {
      ...req.body,
      createdBy: req.userId
    };

    // Create budget items
    const budgetItems = await BudgetItems.create(budgetItemsData);

    sendSuccess(res, budgetItems, 'Budget items created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all budget items with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllBudgetItems = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (status !== undefined) {
      filter.status = 'true';
    }

    // Get budget items with pagination
    const [budgetItems, total] = await Promise.all([
      BudgetItems.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BudgetItems.countDocuments(filter)
    ]);

    // Manually populate item_id and category_id for each budget item's items array
    const populatedBudgetItems = await Promise.all(
      budgetItems.map(async (budgetItem) => {
        const budgetItemObj = budgetItem.toObject();

        if (budgetItemObj.items && budgetItemObj.items.length > 0) {
          budgetItemObj.items = await Promise.all(
            budgetItemObj.items.map(async (item) => {
              const populatedItem = { ...item };

              // Populate item details
              if (item.item_id) {
                const itemDetails = await Items.findOne({ item_id: parseInt(item.item_id) });
                populatedItem.item_details = itemDetails;
              }

              // Populate category details
              if (item.category_id) {
                const categoryDetails = await ItemCategory.findOne({ item_category_id: parseInt(item.category_id) });
                populatedItem.category_details = categoryDetails;
              }

              return populatedItem;
            })
          );
        }

        return budgetItemObj;
      })
    );

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, populatedBudgetItems, pagination, 'Budget items retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get budget items by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBudgetItemsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const budgetItems = await BudgetItems.findOne({ budget_items_id: parseInt(id) });

    if (!budgetItems) {
      return sendNotFound(res, 'Budget items not found');
    }

    // Convert to plain object for manipulation
    const budgetItemsObj = budgetItems.toObject();

    // Manually populate item_id and category_id for each item in the items array
    if (budgetItemsObj.items && budgetItemsObj.items.length > 0) {
      budgetItemsObj.items = await Promise.all(
        budgetItemsObj.items.map(async (item) => {
          const populatedItem = { ...item };

          // Populate item details
          if (item.item_id) {
            const itemDetails = await Items.findOne({ item_id: parseInt(item.item_id) });
            populatedItem.item_details = itemDetails;
          }

          // Populate category details
          if (item.category_id) {
            const categoryDetails = await ItemCategory.findOne({ item_category_id: parseInt(item.category_id) });
            populatedItem.category_details = categoryDetails;
          }

          return populatedItem;
        })
      );
    }

    sendSuccess(res, budgetItemsObj, 'Budget items retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update budget items
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateBudgetItems = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    const budgetItems = await BudgetItems.findOneAndUpdate(
      { budget_items_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!budgetItems) {
      return sendNotFound(res, 'Budget items not found');
    }

    sendSuccess(res, budgetItems, 'Budget items updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete budget items
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteBudgetItems = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const budgetItems = await BudgetItems.findOneAndDelete({ budget_items_id: parseInt(id) });

    if (!budgetItems) {
      return sendNotFound(res, 'Budget items not found');
    }

    sendSuccess(res, null, 'Budget items deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createBudgetItems,
  getAllBudgetItems,
  getBudgetItemsById,
  updateBudgetItems,
  deleteBudgetItems
};
