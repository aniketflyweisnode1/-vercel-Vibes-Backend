const { sendSuccess } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { callEscrow } = require('../../utils/escrowClient');

const buildEscrowPayload = (payload = {}) => {
  const { asCustomer, ...rest } = payload;
  return {
    asCustomer,
    body: rest
  };
};

const createEscrowCustomer = asyncHandler(async (req, res) => {
  const { asCustomer, body } = buildEscrowPayload(req.body);

  const response = await callEscrow({
    method: 'post',
    url: '/customer',
    data: body,
    asCustomer
  });

  sendSuccess(res, response, 'Escrow customer created successfully', 201);
});

const updateEscrowCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { asCustomer, body } = buildEscrowPayload(req.body);

  const response = await callEscrow({
    method: 'patch',
    url: `/customer/${encodeURIComponent(customerId)}`,
    data: body,
    asCustomer
  });

  sendSuccess(res, response, 'Escrow customer updated successfully');
});

const createEscrowTransaction = asyncHandler(async (req, res) => {
  const { asCustomer, body } = buildEscrowPayload(req.body);

  const response = await callEscrow({
    method: 'post',
    url: '/transaction',
    data: body,
    asCustomer
  });

  sendSuccess(res, response, 'Escrow transaction created successfully', 201);
});

const listEscrowTransactions = asyncHandler(async (req, res) => {
  const { asCustomer, ...rest } = req.query;

  const response = await callEscrow({
    method: 'get',
    url: '/transaction',
    params: rest,
    asCustomer
  });

  sendSuccess(res, response, 'Escrow transactions retrieved successfully');
});

const getEscrowTransactionById = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const { asCustomer } = req.query;

  const response = await callEscrow({
    method: 'get',
    url: `/transaction/${encodeURIComponent(transactionId)}`,
    asCustomer
  });

  sendSuccess(res, response, 'Escrow transaction retrieved successfully');
});

const updateEscrowTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const { asCustomer, body } = buildEscrowPayload(req.body);

  const response = await callEscrow({
    method: 'patch',
    url: `/transaction/${encodeURIComponent(transactionId)}`,
    data: body,
    asCustomer
  });

  sendSuccess(res, response, 'Escrow transaction updated successfully');
});

const getEscrowCustomerProfile = asyncHandler(async (req, res) => {
  const { asCustomer } = req.query;

  const response = await callEscrow({
    method: 'get',
    url: '/customer/me',
    asCustomer
  });

  sendSuccess(res, response, 'Escrow customer profile retrieved successfully');
});

module.exports = {
  createEscrowCustomer,
  updateEscrowCustomer,
  createEscrowTransaction,
  listEscrowTransactions,
  getEscrowTransactionById,
  updateEscrowTransaction,
  getEscrowCustomerProfile
};


