const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { callMetamask } = require('../../utils/metamaskClient');
const Transaction = require('../models/transaction.model');
const logger = require('../../utils/logger');

const buildMetamaskPayload = (payload = {}) => {
  const { asCustomer, ...rest } = payload;
  return {
    asCustomer,
    body: rest
  };
};

const createMetamaskCustomer = asyncHandler(async (req, res) => {
  const { asCustomer, body } = buildMetamaskPayload(req.body);

  const response = await callMetamask({
    method: 'post',
    url: '/customer',
    data: body,
    asCustomer
  });

  sendSuccess(res, response, 'Metamask customer created successfully', 201);
});

const updateMetamaskCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { asCustomer, body } = buildMetamaskPayload(req.body);

  const response = await callMetamask({
    method: 'patch',
    url: `/customer/${encodeURIComponent(customerId)}`,
    data: body,
    asCustomer
  });

  sendSuccess(res, response, 'Metamask customer updated successfully');
});

const createMetamaskTransaction = asyncHandler(async (req, res) => {
  const { asCustomer, body } = buildMetamaskPayload(req.body);
  const userId = req.userId;

  const response = await callMetamask({
    method: 'post',
    url: '/transaction',
    data: body,
    asCustomer
  });

  // Create transaction record if Metamask transaction is created successfully
  if (response && response.id) {
    try {
      // Extract amount from response (Metamask/Infura returns amount in the response)
      const amount = response.amount || body.amount || 0;
      
      // Get payment method ID from request body or use default
      const paymentMethodId = body.payment_method_id || req.body.payment_method_id || 1; // Default to 1 if not provided

      // Determine transaction status based on Metamask transaction status
      let transactionStatus = 'pending';
      if (response.status) {
        const escrowStatus = response.status.toLowerCase();
        if (escrowStatus === 'funded' || escrowStatus === 'completed') {
          transactionStatus = 'completed';
        } else if (escrowStatus === 'cancelled') {
          transactionStatus = 'cancelled';
        } else if (escrowStatus === 'failed') {
          transactionStatus = 'failed';
        }
      }

      // Create transaction record
      const transactionData = {
        user_id: userId,
        amount: amount,
        status: transactionStatus,
        payment_method_id: paymentMethodId,
        transactionType: 'MetamaskPayment',
        escrow_transaction_id: response.id.toString(),
        transaction_date: new Date(),
        reference_number: response.id.toString(),
        metadata: JSON.stringify({
          escrow_transaction_id: response.id,
          escrow_status: response.status,
          escrow_response: response
        }),
        created_by: userId,
        created_at: new Date()
      };

      const transaction = await Transaction.create(transactionData);

      // Return response with transaction ID
      sendSuccess(res, {
        escrow_transaction: response,
        transaction: {
          transaction_id: transaction.transaction_id,
          status: transaction.status,
          amount: transaction.amount
        }
      }, 'Metamask transaction created successfully', 201);
    } catch (transactionError) {
      logger.error('Error creating transaction record for Metamask payment:', transactionError);
      // Still return success for Metamask transaction even if our transaction record creation fails
      sendSuccess(res, {
        escrow_transaction: response,
        transaction: null,
        warning: 'Metamask transaction created but transaction record creation failed'
      }, 'Metamask transaction created successfully', 201);
    }
  } else {
    sendSuccess(res, response, 'Metamask transaction created successfully', 201);
  }
});

const listMetamaskTransactions = asyncHandler(async (req, res) => {
  const { asCustomer, ...rest } = req.query;

  const response = await callMetamask({
    method: 'get',
    url: '/transaction',
    params: rest,
    asCustomer
  });

  sendSuccess(res, response, 'Metamask transactions retrieved successfully');
});

const getMetamaskTransactionById = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const { asCustomer } = req.query;

  const response = await callMetamask({
    method: 'get',
    url: `/transaction/${encodeURIComponent(transactionId)}`,
    asCustomer
  });

  sendSuccess(res, response, 'Metamask transaction retrieved successfully');
});

const updateMetamaskTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const { asCustomer, body } = buildMetamaskPayload(req.body);
  const userId = req.userId;

  const response = await callMetamask({
    method: 'patch',
    url: `/transaction/${encodeURIComponent(transactionId)}`,
    data: body,
    asCustomer
  });

  // Update transaction record if Metamask transaction status changed to completed/funded
  if (response && response.status) {
    try {
      const escrowStatus = response.status.toLowerCase();
      let transactionStatus = null;

      if (escrowStatus === 'funded' || escrowStatus === 'completed') {
        transactionStatus = 'completed';
      } else if (escrowStatus === 'cancelled') {
        transactionStatus = 'cancelled';
      } else if (escrowStatus === 'failed') {
        transactionStatus = 'failed';
      }

      // Find and update transaction record by escrow_transaction_id
      if (transactionStatus) {
        const transaction = await Transaction.findOne({
          escrow_transaction_id: transactionId.toString()
        });

        if (transaction) {
          transaction.status = transactionStatus;
          transaction.updated_by = userId;
          transaction.updated_at = new Date();
          
          // Update metadata with latest Metamask response
          try {
            const metadata = JSON.parse(transaction.metadata || '{}');
            metadata.escrow_status = response.status;
            metadata.escrow_response = response;
            transaction.metadata = JSON.stringify(metadata);
          } catch (metadataError) {
            // If metadata parsing fails, create new metadata
            transaction.metadata = JSON.stringify({
              escrow_transaction_id: transactionId,
              escrow_status: response.status,
              escrow_response: response
            });
          }

          await transaction.save();
        }
      }
    } catch (transactionError) {
      logger.error('Error updating transaction record for Metamask payment:', transactionError);
      // Continue even if transaction update fails
    }
  }

  sendSuccess(res, response, 'Metamask transaction updated successfully');
});

const getMetamaskCustomerProfile = asyncHandler(async (req, res) => {
  const { asCustomer } = req.query;

  const response = await callMetamask({
    method: 'get',
    url: '/customer/me',
    asCustomer
  });

  sendSuccess(res, response, 'Metamask customer profile retrieved successfully');
});

/**
 * Test Metamask API connection and authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const testMetamaskConnection = asyncHandler(async (req, res) => {
  try {
    // Try to get customer profile as a test
    const response = await callMetamask({
      method: 'get',
      url: '/customer/me'
    });

    sendSuccess(res, {
      connected: true,
      customer: response,
      message: 'Metamask API connection successful'
    }, 'Metamask API connection test successful');
  } catch (error) {
    logger.error('Metamask API connection test failed', {
      statusCode: error.statusCode,
      message: error.message,
      details: error.details
    });

    sendError(res, `Metamask API connection failed: ${error.message}`, error.statusCode || 500, {
      statusCode: error.statusCode,
      details: error.details
    });
  }
});

module.exports = {
  createMetamaskCustomer,
  updateMetamaskCustomer,
  createMetamaskTransaction,
  listMetamaskTransactions,
  getMetamaskTransactionById,
  updateMetamaskTransaction,
  getMetamaskCustomerProfile,
  testMetamaskConnection
};


