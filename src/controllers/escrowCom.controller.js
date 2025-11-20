const { asyncHandler } = require('../../middleware/errorHandler');
const { sendSuccess } = require('../../utils/response');
const logger = require('../../utils/logger');
const { callEscrow } = require('../../utils/escrowClient');

const createEscrowTransaction = asyncHandler(async (req, res) => {
  const response = await callEscrow({
    method: 'post',
    url: '/transaction',
    data: req.body,
    idempotencyKey: req.headers['idempotency-key']
  });

  sendSuccess(res, response, 'Escrow.com transaction created successfully', 201);
});

const listEscrowTransactions = asyncHandler(async (req, res) => {
  const response = await callEscrow({
    method: 'get',
    url: '/transaction',
    params: req.query
  });

  sendSuccess(res, response, 'Escrow.com transactions retrieved successfully');
});

const getEscrowTransactionById = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const response = await callEscrow({
    method: 'get',
    url: `/transaction/${encodeURIComponent(transactionId)}`
  });

  sendSuccess(res, response, 'Escrow.com transaction retrieved successfully');
});

const updateEscrowTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const response = await callEscrow({
    method: 'put',
    url: `/transaction/${encodeURIComponent(transactionId)}`,
    data: req.body
  });

  sendSuccess(res, response, 'Escrow.com transaction updated successfully');
});

const performEscrowAction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const response = await callEscrow({
    method: 'post',
    url: `/transaction/${encodeURIComponent(transactionId)}/action`,
    data: req.body
  });

  sendSuccess(res, response, 'Escrow.com action executed successfully');
});

const addEscrowMessage = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const response = await callEscrow({
    method: 'post',
    url: `/transaction/${encodeURIComponent(transactionId)}/message`,
    data: req.body
  });

  sendSuccess(res, response, 'Escrow.com message sent successfully');
});

const createEscrowCustomer = asyncHandler(async (req, res) => {
  const response = await callEscrow({
    method: 'post',
    url: '/customer',
    data: req.body
  });

  sendSuccess(res, response, 'Escrow.com customer created successfully', 201);
});

const listEscrowCustomers = asyncHandler(async (req, res) => {
  const response = await callEscrow({
    method: 'get',
    url: '/customer',
    params: req.query
  });

  sendSuccess(res, response, 'Escrow.com customers retrieved successfully');
});

const getEscrowCustomerById = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  const response = await callEscrow({
    method: 'get',
    url: `/customer/${encodeURIComponent(customerId)}`
  });

  sendSuccess(res, response, 'Escrow.com customer retrieved successfully');
});

const testEscrowConnection = asyncHandler(async (req, res) => {
  try {
    const response = await callEscrow({
      method: 'get',
      url: '/transaction',
      params: { limit: 1 }
    });

    sendSuccess(res, {
      connected: true,
      sample: response
    }, 'Escrow.com API connection successful');
  } catch (error) {
    logger.error('Escrow.com API connection test failed', {
      statusCode: error.statusCode,
      message: error.message,
      details: error.details
    });
    throw error;
  }
});

module.exports = {
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
};


