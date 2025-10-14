const BusinessCategory = require('../models/business_category.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new business category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createBusinessCategory = asyncHandler(async (req, res) => {
  try {
    // Create business category data
    const businessCategoryData = {
      ...req.body,
      created_by: req.userId || null
    };

    // Create business category
    const businessCategory = await BusinessCategory.create(businessCategoryData);
    sendSuccess(res, businessCategory, 'Business category created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all business categories (simple - no pagination, search, or filters)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllBusinessCategories = asyncHandler(async (req, res) => {
  try {
    // Get all business categories
    const businessCategories = await BusinessCategory.find()
      .sort({ created_at: -1 });

    sendSuccess(res, businessCategories, 'Business categories retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get business category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBusinessCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const businessCategory = await BusinessCategory.findOne({ business_category_id: parseInt(id) });

    if (!businessCategory) {
      return sendNotFound(res, 'Business category not found');
    }
    sendSuccess(res, businessCategory, 'Business category retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update business category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateBusinessCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const businessCategory = await BusinessCategory.findOneAndUpdate(
      { business_category_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!businessCategory) {
      return sendNotFound(res, 'Business category not found');
    }
    sendSuccess(res, businessCategory, 'Business category updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update business category by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateBusinessCategoryByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const businessCategory = await BusinessCategory.findOneAndUpdate(
      { business_category_id: parseInt(id) },
      finalUpdateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!businessCategory) {
      return sendNotFound(res, 'Business category not found');
    }
    sendSuccess(res, businessCategory, 'Business category updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete business category by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteBusinessCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const businessCategory = await BusinessCategory.findOneAndUpdate(
      { business_category_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!businessCategory) {
      return sendNotFound(res, 'Business category not found');
    }
    sendSuccess(res, businessCategory, 'Business category deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get business categories by authenticated user (simple - no pagination, search, or filters)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBusinessCategoriesByAuth = asyncHandler(async (req, res) => {
  try {
    // Get all business categories created by the authenticated user
    const businessCategories = await BusinessCategory.find({ created_by: req.userId })
      .sort({ created_at: -1 });

    sendSuccess(res, businessCategories, 'Business categories retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createBusinessCategory,
  getAllBusinessCategories,
  getBusinessCategoryById,
  updateBusinessCategory,
  updateBusinessCategoryByIdBody,
  deleteBusinessCategory,
  getBusinessCategoriesByAuth
};

