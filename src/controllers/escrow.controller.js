const { sendSuccess } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { callEscrow } = require('../../utils/escrowClient');
const Transaction = require('../models/transaction.model');
const logger = require('../../utils/logger');

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
  const userId = req.userId;

  const response = await callEscrow({
    method: 'post',
    url: '/transaction',
    data: body,
    asCustomer
  });

  // Create transaction record if Escrow transaction is created successfully
  if (response && response.id) {
    try {
      // Extract amount from response (Escrow API returns amount in the response)
      const amount = response.amount || body.amount || 0;
      
      // Get payment method ID from request body or use default
      const paymentMethodId = body.payment_method_id || req.body.payment_method_id || 1; // Default to 1 if not provided

      // Determine transaction status based on Escrow transaction status
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
        transactionType: 'EscrowPayment',
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
      }, 'Escrow transaction created successfully', 201);
    } catch (transactionError) {
      logger.error('Error creating transaction record for Escrow payment:', transactionError);
      // Still return success for Escrow transaction even if our transaction record creation fails
      sendSuccess(res, {
        escrow_transaction: response,
        transaction: null,
        warning: 'Escrow transaction created but transaction record creation failed'
      }, 'Escrow transaction created successfully', 201);
    }
  } else {
    sendSuccess(res, response, 'Escrow transaction created successfully', 201);
  }
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
  const userId = req.userId;

  const response = await callEscrow({
    method: 'patch',
    url: `/transaction/${encodeURIComponent(transactionId)}`,
    data: body,
    asCustomer
  });

  // Update transaction record if Escrow transaction status changed to completed/funded
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
          
          // Update metadata with latest Escrow response
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
      logger.error('Error updating transaction record for Escrow payment:', transactionError);
      // Continue even if transaction update fails
    }
  }

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

/**
 * Test Escrow API connection and authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const testEscrowConnection = asyncHandler(async (req, res) => {
  try {
    // Try to get customer profile as a test
    const response = await callEscrow({
      method: 'get',
      url: '/customer/me'
    });

    sendSuccess(res, {
      connected: true,
      customer: response,
      message: 'Escrow API connection successful'
    }, 'Escrow API connection test successful');
  } catch (error) {
    logger.error('Escrow API connection test failed', {
      statusCode: error.statusCode,
      message: error.message,
      details: error.details
    });

    sendError(res, `Escrow API connection failed: ${error.message}`, error.statusCode || 500, {
      statusCode: error.statusCode,
      details: error.details
    });
  }
});

module.exports = {
  createEscrowCustomer,
  updateEscrowCustomer,
  createEscrowTransaction,
  listEscrowTransactions,
  getEscrowTransactionById,
  updateEscrowTransaction,
  getEscrowCustomerProfile,
  testEscrowConnection
};


