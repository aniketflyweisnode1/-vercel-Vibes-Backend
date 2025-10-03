const BankName = require('../models/bank_name.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new bank name
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createBankName = asyncHandler(async (req, res) => {
  try {
    // Create bank name data
    const bankNameData = {
      ...req.body,
      created_by: req.userId || null
    };

    // Create bank name
    const bankName = await BankName.create(bankNameData);
    sendSuccess(res, bankName, 'Bank name created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all bank names with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllBankNames = asyncHandler(async (req, res) => {
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
        { bank_name: { $regex: search, $options: 'i' } }
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
    const [bankNames, total] = await Promise.all([
      BankName.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      BankName.countDocuments(filter)
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
    sendPaginated(res, bankNames, pagination, 'Bank names retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get bank name by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBankNameById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const bankName = await BankName.findOne({ bank_name_id: parseInt(id) });

    if (!bankName) {
      return sendNotFound(res, 'Bank name not found');
    }
    sendSuccess(res, bankName, 'Bank name retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update bank name by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateBankName = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const bankName = await BankName.findOneAndUpdate(
      { bank_name_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!bankName) {
      return sendNotFound(res, 'Bank name not found');
    }
    sendSuccess(res, bankName, 'Bank name updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update bank name by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateBankNameByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const bankName = await BankName.findOneAndUpdate(
      { bank_name_id: parseInt(id) },
      finalUpdateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!bankName) {
      return sendNotFound(res, 'Bank name not found');
    }
    sendSuccess(res, bankName, 'Bank name updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete bank name by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteBankName = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const bankName = await BankName.findOneAndUpdate(
      { bank_name_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!bankName) {
      return sendNotFound(res, 'Bank name not found');
    }
    sendSuccess(res, bankName, 'Bank name deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get bank names by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBankNamesByAuth = asyncHandler(async (req, res) => {
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
        { bank_name: { $regex: search, $options: 'i' } }
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
    const [bankNames, total] = await Promise.all([
      BankName.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      BankName.countDocuments(filter)
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
    sendPaginated(res, bankNames, pagination, 'Bank names retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createBankName,
  getAllBankNames,
  getBankNameById,
  updateBankName,
  updateBankNameByIdBody,
  deleteBankName,
  getBankNamesByAuth
};

