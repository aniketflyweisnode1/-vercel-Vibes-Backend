const CateringMarketplaceBooking = require('../models/catering_marketplace_booking.model');
const Event = require('../models/event.model');
const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { createPaymentIntent, createCustomer } = require('../../utils/stripe');

/**
 * Create a new catering marketplace booking
 * First creates an event, then creates the booking and transaction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCateringMarketplaceBooking = asyncHandler(async (req, res) => {
  try {
    const { 
      event_name, 
      event_address, 
      event_type_id,
      catering_marketplace_id,
      event_to_date,
      event_from_date,
      event_to_time,
      event_from_time,
      guest_count,
      amount,
      venue_details_id,
      max_capacity
    } = req.body;

    // First create the event
    const eventData = {
      name_title: event_name,
      street_address: event_address,
      event_type_id: event_type_id,
      venue_details_id: venue_details_id || 1, // Default venue if not provided
      date: event_from_date, // Use event_from_date as the main event date
      time: event_from_time, // Use event_from_time as the main event time
      max_capacity: max_capacity || guest_count, // Use max_capacity or fallback to guest_count
      created_by: req.userId
    };

    const event = await Event.create(eventData);

    // Create the booking
    const bookingData = {
      catering_marketplace_id: catering_marketplace_id,
      event_id: event.event_id,
      event_to_date: event_to_date,
      event_from_date: event_from_date,
      event_to_time: event_to_time,
      event_from_time: event_from_time,
      guest_count: guest_count,
      total_amount: amount || 0,
      created_by: req.userId
    };

    const booking = await CateringMarketplaceBooking.create(bookingData);
console.log(booking);
    // Create transaction
    const transactionData = {
      user_id: req.userId,
      amount: amount || 0,
      status: 'pending',
      payment_method_id: 1, // Default payment method
      transactionType: 'CateringBooking',
      catering_marketplace_booking_id: booking.catering_marketplace_booking_id,
      created_by: req.userId
    };

    const transaction = await Transaction.create(transactionData);

    // Update booking with transaction ID
    const updatedBooking = await CateringMarketplaceBooking.findOneAndUpdate(
      { catering_marketplace_booking_id: booking.catering_marketplace_booking_id },
      { transaction_id: transaction.transaction_id },
      { new: true }
    );

    sendSuccess(res, {
      booking: updatedBooking,
      event: event,
      transaction: transaction
    }, 'Catering marketplace booking created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all catering marketplace bookings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCateringMarketplaceBookings = asyncHandler(async (req, res) => {
  try {
    const cateringMarketplaceBookings = await CateringMarketplaceBooking.find()
      .sort({ created_at: -1 });

    sendSuccess(res, cateringMarketplaceBookings, 'Catering marketplace bookings retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get catering marketplace booking by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCateringMarketplaceBookingById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const cateringMarketplaceBooking = await CateringMarketplaceBooking.findOne({ 
      catering_marketplace_booking_id: parseInt(id) 
    });

    if (!cateringMarketplaceBooking) {
      return sendNotFound(res, 'Catering marketplace booking not found');
    }
    sendSuccess(res, cateringMarketplaceBooking, 'Catering marketplace booking retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update catering marketplace booking by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCateringMarketplaceBooking = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const cateringMarketplaceBooking = await CateringMarketplaceBooking.findOneAndUpdate(
      { catering_marketplace_booking_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!cateringMarketplaceBooking) {
      return sendNotFound(res, 'Catering marketplace booking not found');
    }
    sendSuccess(res, cateringMarketplaceBooking, 'Catering marketplace booking updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete catering marketplace booking by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCateringMarketplaceBooking = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const cateringMarketplaceBooking = await CateringMarketplaceBooking.findOneAndUpdate(
      { catering_marketplace_booking_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!cateringMarketplaceBooking) {
      return sendNotFound(res, 'Catering marketplace booking not found');
    }
    sendSuccess(res, cateringMarketplaceBooking, 'Catering marketplace booking deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Process catering marketplace booking payment
 * Creates a transaction with transactionType = "CateringBooking"
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const CateringMarketplaceBookingPayment = asyncHandler(async (req, res) => {
  try {
    const { 
      catering_marketplace_booking_id, 
      payment_method_id, 
      billingDetails,
      description = 'Catering marketplace booking payment'
    } = req.body;

    // Validate required fields
    if (!catering_marketplace_booking_id || !payment_method_id) {
      return sendError(res, 'catering_marketplace_booking_id and payment_method_id are required', 400);
    }

    // Get the catering marketplace booking to find details
    const cateringBooking = await CateringMarketplaceBooking.findOne({ 
      catering_marketplace_booking_id: parseInt(catering_marketplace_booking_id) 
    });
console.log(cateringBooking);
    if (!cateringBooking) {
      return sendNotFound(res, 'Catering marketplace booking not found');
    }
 
    // Resolve amount: prefer stored total_amount, else request body, else legacy amount field
    let amount = (cateringBooking.total_amount !== undefined && cateringBooking.total_amount !== null)
      ? cateringBooking.total_amount
      : (req.body.amount !== undefined ? req.body.amount : cateringBooking.amount);

    if (amount === undefined || amount === null) {
      return sendError(res, 'Amount not found in booking record. Provide amount in request body.', 400);
    }

    // Normalize and validate Stripe USD constraints
    amount = Number(amount);
    if (Number.isNaN(amount)) {
      return sendError(res, 'Invalid amount. It must be a numeric value.', 400);
    }
    if (amount < 0.5) {
      return sendError(res, 'Amount must be at least $0.50', 400);
    }
    if (amount > 999999.99) {
      return sendError(res, 'Amount exceeds maximum allowed of $999,999.99', 400);
    }

    // Persist resolved amount if booking lacks total_amount
    if (cateringBooking.total_amount === undefined || cateringBooking.total_amount === null) {
      try {
        await CateringMarketplaceBooking.findOneAndUpdate(
          { catering_marketplace_booking_id: cateringBooking.catering_marketplace_booking_id },
          { total_amount: amount, updated_by: req.userId, updated_at: new Date() }
        );
      } catch (e) {
        // non-fatal
      }
    }

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
          catering_marketplace_booking_id: catering_marketplace_booking_id
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
        amount: Math.round(amount), // Convert to cents
        billingDetails: billingDetails,
        currency: 'usd',
        customerEmail: user.email,
        metadata: {
          user_id: req.userId,
          customer_id: customerId,
          catering_marketplace_booking_id: catering_marketplace_booking_id,
          payment_type: 'catering_booking',
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
      transactionType: 'CateringBooking',
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
        catering_marketplace_booking_id: catering_marketplace_booking_id,
        description: description
      }),
      created_by: req.userId
    };

    // Create transaction
    const transaction = await Transaction.create(transactionData);

    // Update the catering marketplace booking with transaction details
    const updatedCateringBooking = await CateringMarketplaceBooking.findOneAndUpdate(
      { catering_marketplace_booking_id: parseInt(catering_marketplace_booking_id) },
      {
        transaction_id: transaction.transaction_id,
        transaction_status: paymentIntent.status,
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
      catering_marketplace_booking_id: catering_marketplace_booking_id,
      catering_booking: {
        id: updatedCateringBooking.catering_marketplace_booking_id,
        transaction_id: updatedCateringBooking.transaction_id,
        transaction_status: updatedCateringBooking.transaction_status,
        event_name: updatedCateringBooking.event_name,
        total_amount: updatedCateringBooking.total_amount
      },
      message: 'Catering marketplace booking payment intent created successfully and booking updated'
    }, 'Catering marketplace booking payment intent created successfully and booking updated');

  } catch (error) {
    console.error('Catering marketplace booking payment error:', error);
    throw error;
  }
});

module.exports = {
  createCateringMarketplaceBooking,
  getAllCateringMarketplaceBookings,
  getCateringMarketplaceBookingById,
  updateCateringMarketplaceBooking,
  deleteCateringMarketplaceBooking,
  CateringMarketplaceBookingPayment
};
