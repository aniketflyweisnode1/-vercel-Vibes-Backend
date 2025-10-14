const Wallet = require('../models/wallet.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new wallet
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createWallet = asyncHandler(async (req, res) => {
  try {
    // Create wallet data
    const walletData = {
      ...req.body,
      amount: req.body.amount || 0,
      created_by: req.userId || null
    };

    // Create wallet
    const wallet = await Wallet.create(walletData);

    sendSuccess(res, wallet, 'Wallet created successfully', 201);
  } catch (error) {
    
    throw error;
  }
});

/**
 * Get all wallets with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllWallets = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { emoji: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
  

    // Add user_id filter
    if (user_id && user_id !== '') {
      filter.user_id = parseInt(user_id);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [wallets, total] = await Promise.all([
      Wallet.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Wallet.countDocuments(filter)
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

    sendPaginated(res, wallets, pagination, 'Wallets retrieved successfully');
  } catch (error) {
   
    throw error;
  }
});

/**
 * Get wallet by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getWalletById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const wallet = await Wallet.findOne({ wallet_id: parseInt(id) });

    if (!wallet) {
      return sendNotFound(res, 'Wallet not found');
    }

    sendSuccess(res, wallet, 'Wallet retrieved successfully');
  } catch (error) {
    
    throw error;
  }
});

/**
 * Get wallet by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getWalletByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;

    const wallet = await Wallet.findOne({ user_id: userId });

    if (!wallet) {
      return sendNotFound(res, 'Wallet not found for this user');
    }

    sendSuccess(res, wallet, 'Wallet retrieved successfully');
  } catch (error) {
    
    throw error;
  }
});

/**
 * Update wallet by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateWallet = asyncHandler(async (req, res) => {
  try {
    const { wallet_id, ...updateFields } = req.body;

    // Add update metadata
    const updateData = {
      ...updateFields,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const wallet = await Wallet.findOneAndUpdate(
      { wallet_id: parseInt(wallet_id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!wallet) {
      return sendNotFound(res, 'Wallet not found');
    }

    sendSuccess(res, wallet, 'Wallet updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update wallet by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateWalletByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const wallet = await Wallet.findOneAndUpdate(
      { user_id: userId },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!wallet) {
      return sendNotFound(res, 'Wallet not found for this user');
    }

    sendSuccess(res, wallet, 'Wallet updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete wallet by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteWallet = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const wallet = await Wallet.findOneAndUpdate(
      { wallet_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!wallet) {
      return sendNotFound(res, 'Wallet not found');
    }

    sendSuccess(res, wallet, 'Wallet deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Create wallet for user (called when user is created)
 * @param {Number} userId - User ID
 * @param {Number} createdBy - ID of user who created this wallet
 * @returns {Object} Created wallet
 */
const createWalletForUser = async (userId, createdBy = null) => {
  try {
    const walletData = {
      user_id: userId,
      amount: 0,
      created_by: createdBy
    };

    const wallet = await Wallet.create(walletData);
    
    return wallet;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createWallet,
  getAllWallets,
  getWalletById,
  getWalletByAuth,
  updateWallet,
  updateWalletByAuth,
  deleteWallet,
  createWalletForUser
};

