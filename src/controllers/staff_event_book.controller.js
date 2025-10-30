const StaffEventBook = require('../models/staff_event_book.model');
const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');
const StaffWorkingPrice = require('../models/staff_working_price.model');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { createPaymentIntent, createCustomer } = require('../../utils/stripe');

/**
 * Create a new staff event booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createStaffEventBook = asyncHandler(async (req, res) => {
  try {
    const staffEventBookData = {
      ...req.body,
      created_by: req.userId
    };

    const staffEventBook = await StaffEventBook.create(staffEventBookData);

    // Try to fetch staff price based on staff_id and staff_category_id
    let staffPrice = null;
    if (staffEventBook.staff_id && staffEventBook.staff_category_id) {
      const priceDoc = await StaffWorkingPrice.findOne({
        staff_id: staffEventBook.staff_id,
        staff_category_id: staffEventBook.staff_category_id,
        status: true
      });
      staffPrice = priceDoc ? priceDoc.price : null;
    }

    const response = {
      ...staffEventBook.toObject(),
      staff_price: staffPrice
    };

    sendSuccess(res, response, 'Staff event booking created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all staff event bookings (simple - no pagination, search, or filters)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllStaffEventBooks = asyncHandler(async (req, res) => {
  try {
    const staffEventBooks = await StaffEventBook.find()
      .sort({ created_at: -1 });

    sendSuccess(res, staffEventBooks, 'Staff event bookings retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get staff event booking by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffEventBookById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const staffEventBook = await StaffEventBook.findOne({ staff_event_book_id: parseInt(id) });

    if (!staffEventBook) {
      return sendNotFound(res, 'Staff event booking not found');
    }
    sendSuccess(res, staffEventBook, 'Staff event booking retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get staff event bookings by authenticated user (simple - no pagination, search, or filters)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffEventBooksByAuth = asyncHandler(async (req, res) => {
  try {
    const staffEventBooks = await StaffEventBook.find({ created_by: req.userId })
      .sort({ created_at: -1 });

    sendSuccess(res, staffEventBooks, 'Staff event bookings retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get staff event bookings by vendor ID (simple - no pagination, search, or filters)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffEventBooksByVendorId = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.userId;
    
    const staffEventBooks = await User.find({ created_by: parseInt(vendorId), role_id: 4 })
      .sort({ created_at: -1 });

    sendSuccess(res, staffEventBooks, 'Staff event bookings retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update staff event booking by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateStaffEventBook = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const staffEventBook = await StaffEventBook.findOneAndUpdate(
      { staff_event_book_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!staffEventBook) {
      return sendNotFound(res, 'Staff event booking not found');
    }
    sendSuccess(res, staffEventBook, 'Staff event booking updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete staff event booking by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteStaffEventBook = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const staffEventBook = await StaffEventBook.findOneAndUpdate(
      { staff_event_book_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!staffEventBook) {
      return sendNotFound(res, 'Staff event booking not found');
    }
    sendSuccess(res, staffEventBook, 'Staff event booking deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Process staff booking payment
 * Creates a transaction with transactionType = "StaffBooking"
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const StaffBookingPayment = asyncHandler(async (req, res) => {
  try {
    const { 
      staff_event_book_id, 
      payment_method_id, 
      billingDetails,
      description = 'Staff booking payment'
    } = req.body;

    // Validate required fields
    if (!staff_event_book_id || !payment_method_id) {
      return sendError(res, 'staff_event_book_id and payment_method_id are required', 400);
    }

    // Get the staff event booking to find staff details
    const staffEventBook = await StaffEventBook.findOne({ 
      staff_event_book_id: parseInt(staff_event_book_id) 
    });

    if (!staffEventBook) {
      return sendNotFound(res, 'Staff event booking not found');
    }

    // Get the staff working price for the staff and category
    const staffWorkingPrice = await StaffWorkingPrice.findOne({
      staff_id: staffEventBook.staff_id,
      staff_category_id: staffEventBook.staff_category_id,
      status: true
    });

    if (!staffWorkingPrice) {
      return sendNotFound(res, 'Staff working price not found for this staff and category');
    }

    const amount = staffWorkingPrice.price;

    // Get user information for Stripe customer creation
    const user = await User.findOne({ user_id: req.userId });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Create or get Stripe customer
    let customerId = null;
    try {
      const customerData = {
        email: user.email,
        name: user.name,
        phone: user.mobile,
        metadata: {
          user_id: req.userId,
          staff_event_book_id: staff_event_book_id
        }
      };

      const customer = await createCustomer(customerData);
      customerId = customer.customerId;
    } catch (customerError) {
      console.error('Customer creation error:', customerError);
      // Continue without customer if creation fails
    }

    // Create Stripe payment intent
    let paymentIntent = null;
    try {
      const paymentOptions = {
        amount: Math.round(amount * 100), // Convert to cents
        billingDetails: billingDetails,
        currency: 'usd',
        customerEmail: user.email,
        metadata: {
          user_id: req.userId,
          customer_id: customerId,
          staff_event_book_id: staff_event_book_id,
          payment_type: billingDetails,
          description: description
        }
      };

      paymentIntent = await createPaymentIntent(paymentOptions);
    } catch (paymentError) {
      console.error('Payment intent creation error:', paymentError);
      return sendError(res, `Payment intent creation failed: ${paymentError.message}`, 400);
    }

    // Create transaction data
    const transactionData = {
      user_id: req.userId,
      amount: amount,
      currency: 'USD',
      status: paymentIntent.status,
      payment_method_id: payment_method_id,
      transactionType: 'StaffBooking',
      transaction_date: new Date(),
      reference_number: paymentIntent.paymentIntentId,
      coupon_code_id: null,
      CGST: 0,
      SGST: 0,
      TotalGST: 0,
      metadata: JSON.stringify({
        stripe_payment_intent_id: paymentIntent.paymentIntentId,
        stripe_client_secret: paymentIntent.clientSecret,
        customer_id: customerId,
        staff_event_book_id: staff_event_book_id,
        description: description
      }),
      created_by: req.userId
    };

    // Create transaction
    const transaction = await Transaction.create(transactionData);

    // Update the staff event booking with transaction details
    const updatedStaffEventBook = await StaffEventBook.findOneAndUpdate(
      { staff_event_book_id: parseInt(staff_event_book_id) },
      {
        transaction_id: transaction.transaction_id,
        transaction_status: 'Completed',
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    sendSuccess(res, {
      transaction_id: transaction.transaction_id,
      payment_intent_id: paymentIntent.paymentIntentId,
      client_secret: paymentIntent.clientSecret,
      amount: amount,
      currency: 'USD',
      status: paymentIntent.status,
      customer_id: customerId,
      staff_event_book_id: staff_event_book_id,
      staff_event_book: {
        id: updatedStaffEventBook.staff_event_book_id,
        transaction_id: updatedStaffEventBook.transaction_id,
        transaction_status: updatedStaffEventBook.transaction_status,
        event_name: updatedStaffEventBook.event_name,
        staff_id: updatedStaffEventBook.staff_id
      },
      message: 'Staff booking payment intent created successfully and booking updated'
    }, 'Staff booking payment intent created successfully and booking updated');

  } catch (error) {
    console.error('Staff booking payment error:', error);
    throw error;
  }
});

module.exports = {
  createStaffEventBook,
  getAllStaffEventBooks,
  getStaffEventBookById,
  getStaffEventBooksByAuth,
  getStaffEventBooksByVendorId,
  updateStaffEventBook,
  deleteStaffEventBook,
  StaffBookingPayment
};

