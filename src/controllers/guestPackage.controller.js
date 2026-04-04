const GuestPackage = require('../models/guestPackage');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new dress code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createGuestPackage = asyncHandler(async (req, res) => {
  try {
    const GuestPackageData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const GuestPackage1 = await GuestPackage.create(GuestPackageData);
    sendSuccess(res, GuestPackage1, 'Dress Code created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all dress codes with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllGuestPackage = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      noOfGuest,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.dress_code_name = { $regex: search, $options: 'i' };
    }

    if (noOfGuest) {
      filter.noOfGuest = { $gte: Number(noOfGuest) };
    }
    if (price) {
      filter.price = { $gte: Number(price) };
    }
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [GuestPackage1, total] = await Promise.all([
      GuestPackage.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      GuestPackage.countDocuments(filter)
    ]);

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
    sendPaginated(res, GuestPackage1, pagination, 'Dress Code retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get dress code by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGuestPackageById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const GuestPackage1 = await GuestPackage.findOne({ dress_code_id: parseInt(id) });

    if (!GuestPackage1) {
      return sendNotFound(res, 'Dress Code not found');
    }
    sendSuccess(res, GuestPackage1, 'Dress Code retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update dress code by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateGuestPackage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const GuestPackage1 = await GuestPackage.findOneAndUpdate(
      { dress_code_id: parseInt(id) },
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!GuestPackage1) {
      return sendNotFound(res, 'Dress Code not found');
    }
    sendSuccess(res, GuestPackage1, 'Dress Code updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete dress code by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteGuestPackage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const GuestPackage1 = await GuestPackage.findOneAndUpdate(
      { dress_code_id: parseInt(id) },
      {
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!GuestPackage1) {
      return sendNotFound(res, 'Dress Code not found');
    }
    sendSuccess(res, GuestPackage1, 'Dress Code deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get dress code created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGuestPackageByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
      price,
      noOfGuest
    } = req.query;

    const filter = {
      created_by: req.userId
    };

    if (search) {
      filter.dress_code_name = { $regex: search, $options: 'i' };
    }
    if (noOfGuest) {
      filter.noOfGuest = { $gte: Number(noOfGuest) };
    }
    if (price) {
      filter.price = { $gte: Number(price) };
    }


    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [GuestPackage1, total] = await Promise.all([
      GuestPackage.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      GuestPackage.countDocuments(filter)
    ]);

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
    sendPaginated(res, GuestPackage1, pagination, 'User dress code retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createGuestPackage,
  getAllGuestPackage,
  getGuestPackageById,
  updateGuestPackage,
  deleteGuestPackage,
  getGuestPackageByAuth
};

