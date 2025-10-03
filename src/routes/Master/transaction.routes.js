const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createTransaction, 
  getAllTransactions, 
  getTransactionById, 
  getTransactionByAuth, 
  getTransactionByTransactionType, 
  updateTransaction, 
  deleteTransaction 
} = require('../../controllers/transaction.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createTransactionSchema, 
  updateTransactionSchema, 
  getTransactionByIdSchema, 
  getTransactionByTransactionTypeSchema, 
  getAllTransactionsSchema 
} = require('../../../validators/transaction.validator');

// Create transaction (with auth)
router.post('/create', auth, validateBody(createTransactionSchema), createTransaction);

// Get all transactions (with auth)
router.get('/getAll', auth, validateQuery(getAllTransactionsSchema), getAllTransactions);

// Get transaction by ID (with auth)
router.get('/getTransactionById/:id', auth, validateParams(getTransactionByIdSchema), getTransactionById);

// Get transactions by authenticated user (with auth)
router.get('/getTransactionByAuth', auth, getTransactionByAuth);

// Get transactions by transaction type (with auth)
router.get('/getTransactionByTransactionType/:transactionType', auth, validateParams(getTransactionByTransactionTypeSchema), getTransactionByTransactionType);

// Update transaction by ID (with auth)
router.put('/updateTransactionById', auth, validateBody(updateTransactionSchema), updateTransaction);

// Delete transaction by ID (with auth)
router.delete('/deleteTransactionById/:id', auth, validateParams(getTransactionByIdSchema), deleteTransaction);

module.exports = router;
