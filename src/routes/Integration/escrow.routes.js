const express = require('express');
const router = express.Router();

const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../../../middleware/validation');
const {
  createEscrowCustomer,
  updateEscrowCustomer,
  createEscrowTransaction,
  listEscrowTransactions,
  getEscrowTransactionById,
  updateEscrowTransaction,
  getEscrowCustomerProfile,
  testEscrowConnection
} = require('../../controllers/escrow.controller');
const {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdParamsSchema,
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdParamsSchema,
  listTransactionQuerySchema,
  asCustomerQuerySchema
} = require('../../../validators/escrow.validator');

router.post('/customers', auth, validateBody(createCustomerSchema), createEscrowCustomer);
router.patch('/customers/:customerId', auth, validateParams(customerIdParamsSchema), validateBody(updateCustomerSchema), updateEscrowCustomer);
router.get('/customers/me', auth, validateQuery(asCustomerQuerySchema), getEscrowCustomerProfile);

router.post('/transactions', auth, validateBody(createTransactionSchema), createEscrowTransaction);
router.get('/transactions', auth, validateQuery(listTransactionQuerySchema), listEscrowTransactions);
router.get('/transactions/:transactionId', auth, validateParams(transactionIdParamsSchema), validateQuery(asCustomerQuerySchema), getEscrowTransactionById);
router.patch('/transactions/:transactionId', auth, validateParams(transactionIdParamsSchema), validateBody(updateTransactionSchema), updateEscrowTransaction);

/**
 * @route   GET /api/integrations/escrow/test-connection
 * @desc    Test Escrow API connection and authentication
 * @access  Private
 */
router.get('/test-connection', auth, testEscrowConnection);

module.exports = router;


