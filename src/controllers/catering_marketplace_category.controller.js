const CateringMarketplaceCategory = require('../models/catering_marketplace_category.model');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new catering marketplace category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCateringMarketplaceCategory = asyncHandler(async (req, res) => {
  try {
    const cateringMarketplaceCategoryData = {
      ...req.body,
      created_by: req.userId
    };

    const cateringMarketplaceCategory = await CateringMarketplaceCategory.create(cateringMarketplaceCategoryData);
    sendSuccess(res, cateringMarketplaceCategory, 'Catering marketplace category created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all catering marketplace categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCateringMarketplaceCategories = asyncHandler(async (req, res) => {
  try {
    const cateringMarketplaceCategories = await CateringMarketplaceCategory.find()
      .sort({ created_at: -1 });

    sendSuccess(res, cateringMarketplaceCategories, 'Catering marketplace categories retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get catering marketplace category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCateringMarketplaceCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const cateringMarketplaceCategory = await CateringMarketplaceCategory.findOne({ 
      catering_marketplace_category_id: parseInt(id) 
    });

    if (!cateringMarketplaceCategory) {
      return sendNotFound(res, 'Catering marketplace category not found');
    }
    sendSuccess(res, cateringMarketplaceCategory, 'Catering marketplace category retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get catering marketplace categories by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCateringMarketplaceCategoriesByAuth = asyncHandler(async (req, res) => {
  try {
    const cateringMarketplaceCategories = await CateringMarketplaceCategory.find({ 
      created_by: req.userId 
    })
      .sort({ created_at: -1 });

    sendSuccess(res, cateringMarketplaceCategories, 'Catering marketplace categories retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update catering marketplace category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCateringMarketplaceCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const cateringMarketplaceCategory = await CateringMarketplaceCategory.findOneAndUpdate(
      { catering_marketplace_category_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!cateringMarketplaceCategory) {
      return sendNotFound(res, 'Catering marketplace category not found');
    }
    sendSuccess(res, cateringMarketplaceCategory, 'Catering marketplace category updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete catering marketplace category by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCateringMarketplaceCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const cateringMarketplaceCategory = await CateringMarketplaceCategory.findOneAndUpdate(
      { catering_marketplace_category_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!cateringMarketplaceCategory) {
      return sendNotFound(res, 'Catering marketplace category not found');
    }
    sendSuccess(res, cateringMarketplaceCategory, 'Catering marketplace category deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createCateringMarketplaceCategory,
  getAllCateringMarketplaceCategories,
  getCateringMarketplaceCategoryById,
  getCateringMarketplaceCategoriesByAuth,
  updateCateringMarketplaceCategory,
  deleteCateringMarketplaceCategory
};
