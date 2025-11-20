const express = require('express');
const router = express.Router();

const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../../../middleware/validation');
const {
  createEscrowTransaction,
  listEscrowTransactions,
  getEscrowTransactionById,
  updateEscrowTransaction,
  performEscrowAction,
  addEscrowMessage,
  createEscrowCustomer,
  listEscrowCustomers,
  getEscrowCustomerById,
  testEscrowConnection
} = require('../../controllers/escrowCom.controller');
const {
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdParamsSchema,
  listTransactionQuerySchema,
  actionSchema,
  messageSchema,
  createCustomerSchema,
  customerIdParamsSchema,
  listCustomerQuerySchema
} = require('../../../validators/escrowCom.validator');

router.post('/customers', auth, validateBody(createCustomerSchema), createEscrowCustomer);

router.get('/customers', auth, validateQuery(listCustomerQuerySchema), listEscrowCustomers);  
router.get('/customers/:customerId', auth, validateParams(customerIdParamsSchema), getEscrowCustomerById);
router.post('/transactions', auth, validateBody(createTransactionSchema), createEscrowTransaction);
router.get('/transactions', auth, validateQuery(listTransactionQuerySchema), listEscrowTransactions);
router.get('/transactions/:transactionId', auth, validateParams(transactionIdParamsSchema), getEscrowTransactionById);
router.put('/transactions/:transactionId', auth, validateParams(transactionIdParamsSchema), validateBody(updateTransactionSchema), updateEscrowTransaction);
router.post('/transactions/:transactionId/actions', auth, validateParams(transactionIdParamsSchema), validateBody(actionSchema), performEscrowAction);
router.post('/transactions/:transactionId/messages', auth, validateParams(transactionIdParamsSchema), validateBody(messageSchema), addEscrowMessage);
router.get('/test-connection',  testEscrowConnection);

module.exports = router;


