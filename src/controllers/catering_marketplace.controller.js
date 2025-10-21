const CateringMarketplace = require('../models/catering_marketplace.model');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new catering marketplace (auto-increments review_count by 1)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCateringMarketplace = asyncHandler(async (req, res) => {
  try {
    const cateringMarketplaceData = {
      ...req.body,
      review_count: (req.body.review_count || 0) + 1, // Increment review_count by 1
      created_by: req.userId
    };

    const cateringMarketplace = await CateringMarketplace.create(cateringMarketplaceData);
    sendSuccess(res, cateringMarketplace, 'Catering marketplace created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all catering marketplaces
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCateringMarketplaces = asyncHandler(async (req, res) => {
  try {
    const cateringMarketplaces = await CateringMarketplace.find()
      .sort({ created_at: -1 });

    sendSuccess(res, cateringMarketplaces, 'Catering marketplaces retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get catering marketplaces by authenticated user (simple - no pagination, search, or filters)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCateringMarketplacesByAuth = asyncHandler(async (req, res) => {
  try {
    const cateringMarketplaces = await CateringMarketplace.find({ created_by: req.userId })
      .sort({ created_at: -1 });

    sendSuccess(res, cateringMarketplaces, 'Catering marketplaces retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get catering marketplace by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCateringMarketplaceById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const cateringMarketplace = await CateringMarketplace.findOne({ 
      catering_marketplace_id: parseInt(id) 
    });

    if (!cateringMarketplace) {
      return sendNotFound(res, 'Catering marketplace not found');
    }
    sendSuccess(res, cateringMarketplace, 'Catering marketplace retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update catering marketplace by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCateringMarketplace = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const cateringMarketplace = await CateringMarketplace.findOneAndUpdate(
      { catering_marketplace_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!cateringMarketplace) {
      return sendNotFound(res, 'Catering marketplace not found');
    }
    sendSuccess(res, cateringMarketplace, 'Catering marketplace updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete catering marketplace by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCateringMarketplace = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const cateringMarketplace = await CateringMarketplace.findOneAndUpdate(
      { catering_marketplace_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!cateringMarketplace) {
      return sendNotFound(res, 'Catering marketplace not found');
    }
    sendSuccess(res, cateringMarketplace, 'Catering marketplace deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createCateringMarketplace,
  getAllCateringMarketplaces,
  getCateringMarketplacesByAuth,
  getCateringMarketplaceById,
  updateCateringMarketplace,
  deleteCateringMarketplace
};
