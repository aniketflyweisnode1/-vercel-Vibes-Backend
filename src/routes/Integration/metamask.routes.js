const express = require('express');
const router = express.Router();

const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../../../middleware/validation');
const {
  createMetamaskCustomer,
  updateMetamaskCustomer,
  createMetamaskTransaction,
  listMetamaskTransactions,
  getMetamaskTransactionById,
  updateMetamaskTransaction,
  getMetamaskCustomerProfile,
  testMetamaskConnection
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

router.post('/customers', auth, validateBody(createCustomerSchema), createMetamaskCustomer);
router.patch('/customers/:customerId', auth, validateParams(customerIdParamsSchema), validateBody(updateCustomerSchema), updateMetamaskCustomer);
router.get('/customers/me', auth, validateQuery(asCustomerQuerySchema), getMetamaskCustomerProfile);

router.post('/transactions', auth, validateBody(createTransactionSchema), createMetamaskTransaction);
router.get('/transactions', auth, validateQuery(listTransactionQuerySchema), listMetamaskTransactions);
router.get('/transactions/:transactionId', auth, validateParams(transactionIdParamsSchema), validateQuery(asCustomerQuerySchema), getMetamaskTransactionById);
router.patch('/transactions/:transactionId', auth, validateParams(transactionIdParamsSchema), validateBody(updateTransactionSchema), updateMetamaskTransaction);

/**
 * @route   GET /api/integrations/metamask/test-connection
 * @desc    Test Metamask API connection and authentication
 * @access  Private
 */
router.get('/test-connection',  testMetamaskConnection);

module.exports = router;


