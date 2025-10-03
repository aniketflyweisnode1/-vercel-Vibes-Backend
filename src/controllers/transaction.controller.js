const Transaction = require('../models/transaction.model');
const Wallet = require('../models/wallet.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new transaction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTransaction = asyncHandler(async (req, res) => {
  try {
    // Create transaction data
    const transactionData = {
      ...req.body,
      created_by: req.userId || null
    };

    // Create transaction
    const transaction = await Transaction.create(transactionData);

    // Update wallet based on transaction type
    await updateWalletForTransaction(transaction);

    logger.info('Transaction created successfully', { 
      transactionId: transaction._id, 
      transaction_id: transaction.transaction_id 
    });

    sendSuccess(res, transaction, 'Transaction created successfully', 201);
  } catch (error) {
    logger.error('Error creating transaction', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Update wallet based on transaction type
 * @param {Object} transaction - Transaction object
 */
const updateWalletForTransaction = async (transaction) => {
  try {
    const wallet = await Wallet.findOne({ user_id: transaction.user_id });
    
    if (!wallet) {
      logger.warn('Wallet not found for user', { userId: transaction.user_id });
      return;
    }

    let newAmount = wallet.amount;

    // Update wallet amount based on transaction type
    switch (transaction.transactionType) {
      case 'deposit':
      case 'RechargeByAdmin':
      case 'Recharge':
        if (transaction.status === 'completed') {
          newAmount += transaction.amount;
        }
        break;
      case 'withdraw':
        if (transaction.status === 'completed') {
          newAmount -= transaction.amount;
          if (newAmount < 0) {
            newAmount = 0; // Prevent negative balance
          }
        }
        break;
      case 'Registration_fee':
      case 'Call':
      case 'Package_Buy':
        if (transaction.status === 'completed') {
          newAmount -= transaction.amount;
          if (newAmount < 0) {
            newAmount = 0; // Prevent negative balance
          }
        }
        break;
      default:
        logger.warn('Unknown transaction type', { transactionType: transaction.transactionType });
    }

    // Update wallet if amount changed
    if (newAmount !== wallet.amount) {
      await Wallet.findOneAndUpdate(
        { user_id: transaction.user_id },
        { 
          amount: newAmount,
          updated_by: transaction.created_by,
          updated_at: new Date()
        }
      );
      
      logger.info('Wallet updated for transaction', { 
        userId: transaction.user_id,
        oldAmount: wallet.amount,
        newAmount: newAmount,
        transactionType: transaction.transactionType
      });
    }
  } catch (error) {
    logger.error('Error updating wallet for transaction', { 
      error: error.message, 
      transactionId: transaction.transaction_id 
    });
    throw error;
  }
};

/**
 * Get all transactions with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllTransactions = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      transactionType,
      payment_method,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { reference_number: { $regex: search, $options: 'i' } },
        { payment_method: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined && status !== '') {
      filter.status = status;
    }

    // Add user_id filter
    if (user_id && user_id !== '') {
      filter.user_id = parseInt(user_id);
    }

    // Add transactionType filter
    if (transactionType && transactionType !== '') {
      filter.transactionType = transactionType;
    }

    // Add payment_method filter
    if (payment_method && payment_method !== '') {
      filter.payment_method = { $regex: payment_method, $options: 'i' };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(filter)
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

    logger.info('Transactions retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, transactions, pagination, 'Transactions retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving transactions', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get transaction by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTransactionById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({ 
      transaction_id: parseInt(id) 
    });

    if (!transaction) {
      return sendNotFound(res, 'Transaction not found');
    }

    logger.info('Transaction retrieved successfully', { 
      transactionId: transaction._id 
    });

    sendSuccess(res, transaction, 'Transaction retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving transaction', { 
      error: error.message, 
      transactionId: req.params.id 
    });
    throw error;
  }
});

/**
 * Get transactions by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTransactionByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;

    // Get transactions for the authenticated user
    const transactions = await Transaction.find({ 
      user_id: userId 
    }).sort({ created_at: -1 });

    logger.info('Transactions retrieved successfully for user', { 
      userId, 
      count: transactions.length 
    });

    sendSuccess(res, transactions, 'Transactions retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving transactions by auth', { 
      error: error.message, 
      userId: req.userId 
    });
    throw error;
  }
});

/**
 * Get transactions by transaction type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTransactionByTransactionType = asyncHandler(async (req, res) => {
  try {
    const { transactionType } = req.params;

    // Get transactions by transaction type
    const transactions = await Transaction.find({ 
      transactionType: transactionType 
    }).sort({ created_at: -1 });

    logger.info('Transactions retrieved successfully by type', { 
      transactionType, 
      count: transactions.length 
    });

    sendSuccess(res, transactions, 'Transactions retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving transactions by type', { 
      error: error.message, 
      transactionType: req.params.transactionType 
    });
    throw error;
  }
});

/**
 * Update transaction by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTransaction = asyncHandler(async (req, res) => {
  try {
    const { transaction_id, ...updateFields } = req.body;

    // Get the original transaction to check if status changed
    const originalTransaction = await Transaction.findOne({ 
      transaction_id: parseInt(transaction_id) 
    });

    if (!originalTransaction) {
      return sendNotFound(res, 'Transaction not found');
    }

    // Add update metadata
    const updateData = {
      ...updateFields,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const transaction = await Transaction.findOneAndUpdate(
      { transaction_id: parseInt(transaction_id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    // If status changed to completed, update wallet
    if (originalTransaction.status !== 'completed' && transaction.status === 'completed') {
      await updateWalletForTransaction(transaction);
    }

    logger.info('Transaction updated successfully', { 
      transactionId: transaction._id 
    });

    sendSuccess(res, transaction, 'Transaction updated successfully');
  } catch (error) {
    logger.error('Error updating transaction', { 
      error: error.message, 
      transactionId: req.params.id 
    });
    throw error;
  }
});

/**
 * Delete transaction by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteTransaction = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndUpdate(
      { transaction_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!transaction) {
      return sendNotFound(res, 'Transaction not found');
    }

    logger.info('Transaction deleted successfully', { 
      transactionId: transaction._id 
    });

    sendSuccess(res, transaction, 'Transaction deleted successfully');
  } catch (error) {
    logger.error('Error deleting transaction', { 
      error: error.message, 
      transactionId: req.params.id 
    });
    throw error;
  }
});

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getTransactionByAuth,
  getTransactionByTransactionType,
  updateTransaction,
  deleteTransaction
};
