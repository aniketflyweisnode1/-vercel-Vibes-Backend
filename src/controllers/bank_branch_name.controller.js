const BankBranchName = require('../models/bank_branch_name.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new bank branch name
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createBankBranchName = asyncHandler(async (req, res) => {
  try {
    // Create bank branch name data
    const bankBranchNameData = {
      ...req.body,
      created_by: req.userId || null
    };

    // Create bank branch name
    const bankBranchName = await BankBranchName.create(bankBranchNameData);
    sendSuccess(res, bankBranchName, 'Bank branch name created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all bank branch names with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllBankBranchNames = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      bank_name_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { bank_branch_name: { $regex: search, $options: 'i' } },
        { bank_name_id: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = 'true';
    }

    // Add bank_name_id filter
    if (bank_name_id) {
      filter.bank_name_id = parseInt(bank_name_id);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [bankBranchNames, total] = await Promise.all([
      BankBranchName.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      BankBranchName.countDocuments(filter)
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
    sendPaginated(res, bankBranchNames, pagination, 'Bank branch names retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get bank branch name by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBankBranchNameById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const bankBranchName = await BankBranchName.findOne({ bank_branch_name_id: parseInt(id) });

    if (!bankBranchName) {
      return sendNotFound(res, 'Bank branch name not found');
    }
    sendSuccess(res, bankBranchName, 'Bank branch name retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update bank branch name by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateBankBranchName = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const bankBranchName = await BankBranchName.findOneAndUpdate(
      { bank_branch_name_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!bankBranchName) {
      return sendNotFound(res, 'Bank branch name not found');
    }
    sendSuccess(res, bankBranchName, 'Bank branch name updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update bank branch name by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateBankBranchNameByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const bankBranchName = await BankBranchName.findOneAndUpdate(
      { bank_branch_name_id: parseInt(id) },
      finalUpdateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!bankBranchName) {
      return sendNotFound(res, 'Bank branch name not found');
    }
    sendSuccess(res, bankBranchName, 'Bank branch name updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete bank branch name by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteBankBranchName = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const bankBranchName = await BankBranchName.findOneAndUpdate(
      { bank_branch_name_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!bankBranchName) {
      return sendNotFound(res, 'Bank branch name not found');
    }
    sendSuccess(res, bankBranchName, 'Bank branch name deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get bank branch names by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBankBranchNamesByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      bank_name_id,
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
        { bank_branch_name: { $regex: search, $options: 'i' } },
        { bank_name_id: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = 'true';
    }

    // Add bank_name_id filter
    if (bank_name_id) {
      filter.bank_name_id = parseInt(bank_name_id);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [bankBranchNames, total] = await Promise.all([
      BankBranchName.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      BankBranchName.countDocuments(filter)
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
    sendPaginated(res, bankBranchNames, pagination, 'Bank branch names retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createBankBranchName,
  getAllBankBranchNames,
  getBankBranchNameById,
  updateBankBranchName,
  updateBankBranchNameByIdBody,
  deleteBankBranchName,
  getBankBranchNamesByAuth
};

