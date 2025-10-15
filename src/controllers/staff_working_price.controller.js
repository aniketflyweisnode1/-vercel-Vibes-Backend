const StaffWorkingPrice = require('../models/staff_working_price.model');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new staff working price (auto-increments review_count by 1)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createStaffWorkingPrice = asyncHandler(async (req, res) => {
  try {
    const staffWorkingPriceData = {
      ...req.body,
      review_count: (req.body.review_count || 0) + 1, // Increment review_count by 1
      created_by: req.userId
    };

    const staffWorkingPrice = await StaffWorkingPrice.create(staffWorkingPriceData);
    sendSuccess(res, staffWorkingPrice, 'Staff working price created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all staff working prices (simple - no pagination, search, or filters)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllStaffWorkingPrices = asyncHandler(async (req, res) => {
  try {
    const staffWorkingPrices = await StaffWorkingPrice.find()
      .sort({ created_at: -1 });

    sendSuccess(res, staffWorkingPrices, 'Staff working prices retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get staff working price by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffWorkingPriceById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const staffWorkingPrice = await StaffWorkingPrice.findOne({ staff_working_price_id: parseInt(id) });

    if (!staffWorkingPrice) {
      return sendNotFound(res, 'Staff working price not found');
    }
    sendSuccess(res, staffWorkingPrice, 'Staff working price retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get staff working prices by category ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffWorkingPricesByCategoryId = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const staffWorkingPrices = await StaffWorkingPrice.find({ staff_category_id: parseInt(id) })
      .sort({ created_at: -1 });

    sendSuccess(res, staffWorkingPrices, 'Staff working prices retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update staff working price by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateStaffWorkingPrice = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const staffWorkingPrice = await StaffWorkingPrice.findOneAndUpdate(
      { staff_working_price_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!staffWorkingPrice) {
      return sendNotFound(res, 'Staff working price not found');
    }
    sendSuccess(res, staffWorkingPrice, 'Staff working price updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete staff working price by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteStaffWorkingPrice = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const staffWorkingPrice = await StaffWorkingPrice.findOneAndUpdate(
      { staff_working_price_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!staffWorkingPrice) {
      return sendNotFound(res, 'Staff working price not found');
    }
    sendSuccess(res, staffWorkingPrice, 'Staff working price deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createStaffWorkingPrice,
  getAllStaffWorkingPrices,
  getStaffWorkingPriceById,
  getStaffWorkingPricesByCategoryId,
  updateStaffWorkingPrice,
  deleteStaffWorkingPrice
};

