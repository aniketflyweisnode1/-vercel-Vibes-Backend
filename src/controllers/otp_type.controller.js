const OtpType = require('../models/otp_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new OTP type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createOtpType = asyncHandler(async (req, res) => {
  try {
    // Create OTP type data
    const otpTypeData = {
      ...req.body,
      created_by: req.userId
    };

    // Create OTP type
    const otpType = await OtpType.create(otpTypeData);
    sendSuccess(res, otpType, 'OTP type created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all OTP types with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllOtpTypes = asyncHandler(async (req, res) => {
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
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
      if (status == undefined) {
      filter.status = 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [otpTypes, total] = await Promise.all([
      OtpType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      OtpType.countDocuments(filter)
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
    sendPaginated(res, otpTypes, pagination, 'OTP types retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get OTP type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getOtpTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const otpType = await OtpType.findOne({ otp_type_id: parseInt(id) });

    if (!otpType) {
      return sendNotFound(res, 'OTP type not found');
    }
    sendSuccess(res, otpType, 'OTP type retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update OTP type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateOtpType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const otpType = await OtpType.findOneAndUpdate(
      { otp_type_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!otpType) {
      return sendNotFound(res, 'OTP type not found');
    }
    sendSuccess(res, otpType, 'OTP type updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete OTP type by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteOtpType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const otpType = await OtpType.findOneAndUpdate(
      { otp_type_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!otpType) {
      return sendNotFound(res, 'OTP type not found');
    }
    sendSuccess(res, otpType, 'OTP type deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get OTP types by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getOtpTypesByAuth = asyncHandler(async (req, res) => {
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
    const filter = {
      created_by: req.userId
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status == undefined) {
      filter.status = 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [otpTypes, total] = await Promise.all([
      OtpType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      OtpType.countDocuments(filter)
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
    sendPaginated(res, otpTypes, pagination, 'User OTP types retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createOtpType,
  getAllOtpTypes,
  getOtpTypeById,
  updateOtpType,
  deleteOtpType,
  getOtpTypesByAuth
};

