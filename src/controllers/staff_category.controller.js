const StaffCategory = require('../models/staff_category.model');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new staff category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createStaffCategory = asyncHandler(async (req, res) => {
  try {
    const staffCategoryData = {
      ...req.body,
      created_by: req.userId
    };

    const staffCategory = await StaffCategory.create(staffCategoryData);
    sendSuccess(res, staffCategory, 'Staff category created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all staff categories (simple - no pagination, search, or filters)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllStaffCategories = asyncHandler(async (req, res) => {
  try {
    const staffCategories = await StaffCategory.find()
      .sort({ created_at: -1 });

    sendSuccess(res, staffCategories, 'Staff categories retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get staff category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const staffCategory = await StaffCategory.findOne({ staff_category_id: parseInt(id) });

    if (!staffCategory) {
      return sendNotFound(res, 'Staff category not found');
    }
    sendSuccess(res, staffCategory, 'Staff category retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get staff categories by authenticated user (simple - no pagination, search, or filters)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffCategoriesByAuth = asyncHandler(async (req, res) => {
  try {
    const staffCategories = await StaffCategory.find({ created_by: req.userId })
      .sort({ created_at: -1 });

    sendSuccess(res, staffCategories, 'Staff categories retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update staff category by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateStaffCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const staffCategory = await StaffCategory.findOneAndUpdate(
      { staff_category_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!staffCategory) {
      return sendNotFound(res, 'Staff category not found');
    }
    sendSuccess(res, staffCategory, 'Staff category updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete staff category by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteStaffCategory = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const staffCategory = await StaffCategory.findOneAndUpdate(
      { staff_category_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!staffCategory) {
      return sendNotFound(res, 'Staff category not found');
    }
    sendSuccess(res, staffCategory, 'Staff category deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createStaffCategory,
  getAllStaffCategories,
  getStaffCategoryById,
  getStaffCategoriesByAuth,
  updateStaffCategory,
  deleteStaffCategory
};

