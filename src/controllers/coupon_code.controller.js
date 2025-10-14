const CouponCode = require('../models/coupon_code.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new coupon code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCouponCode = asyncHandler(async (req, res) => {
  try {
    // Create coupon code data
    const couponCodeData = {
      ...req.body,
      created_by: req.userId || null
    };

    // Create coupon code
    const couponCode = await CouponCode.create(couponCodeData);
    sendSuccess(res, couponCode, 'Coupon code created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all coupon codes with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCouponCodes = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { emoji: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [couponCodes, total] = await Promise.all([
      CouponCode.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      CouponCode.countDocuments(filter)
    ]);

    // Calculate pagination info
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
    sendPaginated(res, couponCodes, pagination, 'Coupon codes retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get coupon code by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCouponCodeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const couponCode = await CouponCode.findOne({ 
      coupon_code_id: parseInt(id) 
    });

    if (!couponCode) {
      return sendNotFound(res, 'Coupon code not found');
    }
    sendSuccess(res, couponCode, 'Coupon code retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get coupon codes by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCouponCodeByAuth = asyncHandler(async (req, res) => {
  try {
    
    const userId = req.userId;

    // Get coupon codes created by the authenticated user
    const couponCodes = await CouponCode.find({ 
      created_by: userId 
    }).sort({ created_at: -1 });
    sendSuccess(res, couponCodes, 'Coupon codes retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update coupon code by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCouponCode = asyncHandler(async (req, res) => {
  try {
    const { coupon_code_id, ...updateFields } = req.body;

    // Add update metadata
    const updateData = {
      ...updateFields,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const couponCode = await CouponCode.findOneAndUpdate(
      { coupon_code_id: parseInt(coupon_code_id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!couponCode) {
      return sendNotFound(res, 'Coupon code not found');
    }
    sendSuccess(res, couponCode, 'Coupon code updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete coupon code by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCouponCode = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const couponCode = await CouponCode.findOneAndUpdate(
      { coupon_code_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!couponCode) {
      return sendNotFound(res, 'Coupon code not found');
    }
    sendSuccess(res, couponCode, 'Coupon code deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createCouponCode,
  getAllCouponCodes,
  getCouponCodeById,
  getCouponCodeByAuth,
  updateCouponCode,
  deleteCouponCode
};

