const OTP = require('../models/otp.model');
const { generateOTP } = require('../../utils/helpers');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new OTP
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createOTP = asyncHandler(async (req, res) => {
  try {
    // Generate 6-digit OTP
    const otpCode = generateOTP();

    // Create OTP data
    const otpData = {
      ...req.body,
      otp: otpCode,
      created_by: req.userId || null
    };

    // Create OTP
    const otp = await OTP.create(otpData);
    sendSuccess(res, otp, 'OTP created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all OTPs with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllOTPs = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      otp_type,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { otp: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status == undefined) {
      filter.status = 'true';
    }

    // Add OTP type filter
    if (otp_type) {
      filter.otp_type = parseInt(otp_type);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [otps, total] = await Promise.all([
      OTP.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      OTP.countDocuments(filter)
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
    sendPaginated(res, otps, pagination, 'OTPs retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get OTP by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getOTPById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const otp = await OTP.findOne({ otp_id: parseInt(id) });

    if (!otp) {
      return sendNotFound(res, 'OTP not found');
    }
    sendSuccess(res, otp, 'OTP retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update OTP by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateOTP = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const otp = await OTP.findOneAndUpdate(
      { otp_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!otp) {
      return sendNotFound(res, 'OTP not found');
    }
    sendSuccess(res, otp, 'OTP updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete OTP by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteOTP = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const otp = await OTP.findOneAndDelete({ otp_id: parseInt(id) });

    if (!otp) {
      return sendNotFound(res, 'OTP not found');
    }

    sendSuccess(res, null, 'OTP deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createOTP,
  getAllOTPs,
  getOTPById,
  updateOTP,
  deleteOTP
};

