const EventEntryTicketsOrder = require('../models/event_entry_tickets_order.model');
const EventEntryUsergetTickets = require('../models/event_entry_userget_tickets.model');
const EventEntryTickets = require('../models/event_entry_tickets.model');
const Event = require('../models/event.model');
const Transaction = require('../models/transaction.model');
const CouponCode = require('../models/coupon_code.model');
const User = require('../models/user.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { createPaymentIntent, createCustomer, confirmPaymentIntent } = require('../../utils/stripe');

/**
 * Create a new event entry tickets order
 * Automatically finds purchase by event_id and authenticated user
 * Automatically calculates quantity, price, tax, subtotal, and total
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEventEntryTicketsOrder = asyncHandler(async (req, res) => {
  try {
    const { event_id, tax_percentage = 0, coupon_code } = req.body;

    // Get the event (for validation)
    const event = await Event.findOne({ event_id: parseInt(event_id) });

    if (!event) {
      return sendNotFound(res, 'Event not found');
    }

    // Find the userget ticket (purchase record) by event_id and createdBy (authenticated user)
    const usergetTicket = await EventEntryUsergetTickets.findOne({ 
      event_id: parseInt(event_id),
      createdBy: req.userId
    }).sort({ createdAt: -1 }); // Get the most recent purchase

    if (!usergetTicket) {
      return sendNotFound(res, 'No ticket purchase found for this event by the authenticated user');
    }

    // Check if tickets array exists
    if (!usergetTicket.tickets || usergetTicket.tickets.length === 0) {
      return sendError(res, 'No tickets found in the purchase record', 400);
    }

    // Calculate total quantity and subtotal by processing all tickets
    let totalQuantity = 0;
    let subtotal = 0;
    const ticketBreakdown = [];

    for (const ticket of usergetTicket.tickets) {
      // Get the ticket type for each ticket in the array
      const ticketType = await EventEntryTickets.findOne({ 
        event_entry_tickets_id: parseInt(ticket.event_entry_tickets_id) 
      });

      if (!ticketType) {
        return sendNotFound(res, `Event entry ticket type not found for ID: ${ticket.event_entry_tickets_id}`);
      }

      const itemQuantity = ticket.quantity;
      const itemPrice = ticketType.price;
      const itemSubtotal = itemQuantity * itemPrice;

      totalQuantity += itemQuantity;
      subtotal += itemSubtotal;

      ticketBreakdown.push({
        ticket_type_id: ticket.event_entry_tickets_id,
        ticket_title: ticketType.title,
        quantity: itemQuantity,
        price_per_ticket: itemPrice,
        item_subtotal: itemSubtotal
      });
    }

    // Calculate tax (default 0% if not provided)
    const taxAmount = (subtotal * parseFloat(tax_percentage)) / 100;

    // Calculate total before discount
    const total = subtotal + taxAmount;

    // Handle coupon code if provided
    let discountAmount = 0;
    let couponCodeId = null;
    let couponDetails = null;

    if (coupon_code) {
      const coupon = await CouponCode.findOne({ 
        code: coupon_code.toUpperCase(),
        status: true
      });

      if (coupon) {
        // Check if coupon is valid
        const now = new Date();
        if (coupon.valid_from && new Date(coupon.valid_from) > now) {
          return sendError(res, 'Coupon code is not yet valid', 400);
        }

        // Check minimum order amount
        if (total < coupon.min_order_amount) {
          return sendError(res, `Minimum order amount of ${coupon.min_order_amount} required for this coupon`, 400);
        }

        // Check usage limit
        if (coupon.used_count >= coupon.usage_limit) {
          return sendError(res, 'Coupon code usage limit exceeded', 400);
        }

        // Calculate discount
        discountAmount = coupon.price;
        
        // Apply max discount limit
        if (discountAmount > coupon.max_discount_amount) {
          discountAmount = coupon.max_discount_amount;
        }

        // Discount cannot exceed total
        if (discountAmount > total) {
          discountAmount = total;
        }

        couponCodeId = coupon.coupon_code_id;
        couponDetails = {
          code: coupon.code,
          name: coupon.name,
          discount_value: coupon.price,
          applied_discount: discountAmount
        };

        // Increment usage count
        await CouponCode.findOneAndUpdate(
          { coupon_code_id: coupon.coupon_code_id },
          { 
            $inc: { used_count: 1 },
            updated_by: req.userId,
            updated_at: new Date()
          }
        );
      } else {
        return sendError(res, 'Invalid or inactive coupon code', 400);
      }
    }

    // Calculate final amount after discount
    const finalAmount = total - discountAmount;

    // Create order data
    const orderData = {
      event_entry_userget_tickets_id: usergetTicket.event_entry_userget_tickets_id,
      event_id: parseInt(event_id),
      quantity: totalQuantity,
      price: subtotal / totalQuantity, // Average price
      subtotal: subtotal,
      tax: taxAmount,
      total: total,
      coupon_code_id: couponCodeId,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      createdBy: req.userId
    };

    const order = await EventEntryTicketsOrder.create(orderData);

    sendSuccess(res, {
      ...order.toObject(),
      calculation_details: {
        total_quantity: totalQuantity,
        ticket_breakdown: ticketBreakdown,
        subtotal: subtotal,
        tax_percentage: tax_percentage,
        tax_amount: taxAmount,
        total_before_discount: total,
        coupon_applied: couponDetails,
        discount_amount: discountAmount,
        final_amount: finalAmount
      }
    }, 'Event entry tickets order created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all event entry tickets orders with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEventEntryTicketsOrders = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, event_id, event_entry_userget_tickets_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
  
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }
    if (event_entry_userget_tickets_id) {
      filter.event_entry_userget_tickets_id = parseInt(event_entry_userget_tickets_id);
    }

    const [orders, total] = await Promise.all([
      EventEntryTicketsOrder.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventEntryTicketsOrder.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, orders, pagination, 'Event entry tickets orders retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event entry tickets order by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventEntryTicketsOrderById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const order = await EventEntryTicketsOrder.findOne({ event_entry_tickets_order_id: parseInt(id) });

    if (!order) {
      return sendNotFound(res, 'Event entry tickets order not found');
    }

    sendSuccess(res, order, 'Event entry tickets order retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event entry tickets orders by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventEntryTicketsOrdersByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, event_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { createdBy: req.userId };
  
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }

    const [orders, total] = await Promise.all([
      EventEntryTicketsOrder.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventEntryTicketsOrder.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, orders, pagination, 'User event entry tickets orders retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update event entry tickets order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventEntryTicketsOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    req.body.updatedBy = req.userId;
    req.body.updatedAt = new Date();

    const order = await EventEntryTicketsOrder.findOneAndUpdate(
      { event_entry_tickets_order_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!order) {
      return sendNotFound(res, 'Event entry tickets order not found');
    }

    sendSuccess(res, order, 'Event entry tickets order updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete event entry tickets order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEventEntryTicketsOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const order = await EventEntryTicketsOrder.findOneAndDelete({ event_entry_tickets_order_id: parseInt(id) });

    if (!order) {
      return sendNotFound(res, 'Event entry tickets order not found');
    }

    sendSuccess(res, null, 'Event entry tickets order deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Process payment for event entry tickets order
 * Creates a Stripe payment intent and transaction with type 'TicketBooking'
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processPayment = asyncHandler(async (req, res) => {
  try {
    const { order_id, payment_method_id, billingDetails } = req.body;

    // Find the order
    const order = await EventEntryTicketsOrder.findOne({ 
      event_entry_tickets_order_id: parseInt(order_id) 
    });

    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    // Check if order belongs to the authenticated user
    if (order.createdBy !== req.userId) {
      return sendError(res, 'Unauthorized: This order does not belong to you', 403);
    }

    // Get user information for Stripe customer creation
    const user = await User.findOne({ user_id: req.userId });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    //const paymentMethod = await PaymentMethods.findOne({ payment_methods_id: parseInt(payment_method_id) });

    // Create or get Stripe customer
    let customerId = null;
    try {
      const customerData = {
        email: user.email,
        name: user.name,
        phone: user.mobile,
        metadata: {
          user_id: req.userId,
          order_id: order.event_entry_tickets_order_id
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
        amount: order.final_amount,
        billingDetails: billingDetails,
        currency: 'usd',
        customerEmail: user.email,
        metadata: {
          user_id: req.userId,
          customer_id: customerId,
          order_id: order.event_entry_tickets_order_id,
          event_id: order.event_id,
          payment_type: 'ticket_booking',
          description: `Event ticket booking for order ${order.event_entry_tickets_order_id}`
        }
      };

      paymentIntent = await createPaymentIntent(paymentOptions);
    } catch (paymentError) {
      console.error('Payment intent creation error:', paymentError);
      return sendError(res, `Payment intent creation failed: ${paymentError.message}`, 400);
    }

    console.log(order);
    // Create transaction data
    const transactionData = {
      user_id: req.userId,
      amount: order.final_amount,
      currency: 'USD',
      status: paymentIntent.status,
      payment_method_id: payment_method_id,
      transactionType: 'TicketBooking',
      transaction_date: new Date(),
      reference_number: paymentIntent.paymentIntentId,
      coupon_code_id: order.coupon_code_id,
      CGST: 0,
      SGST: 0,
      TotalGST: order.tax,
      metadata: JSON.stringify({
        stripe_payment_intent_id: paymentIntent.paymentIntentId,
        stripe_client_secret: paymentIntent.clientSecret,
        customer_id: customerId,
        order_id: order.event_entry_tickets_order_id,
        event_id: order.event_id
      }),
      created_by: req.userId
    };

    // Create the transaction
    const transaction = await Transaction.create(transactionData);

    // Update order status to mark as paid
    await EventEntryTicketsOrder.findOneAndUpdate(
      { event_entry_tickets_order_id: parseInt(order_id) },
      { 
        updatedBy: req.userId,
        updatedAt: new Date()
      }
    );

    sendSuccess(res, {
      paymentIntent: {
        id: paymentIntent.paymentIntentId,
        clientSecret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      },
      transaction: transaction,
      order: order,
      customer_id: customerId,
      payment_summary: {
        order_id: order.event_entry_tickets_order_id,
        subtotal: order.subtotal,
        tax: order.tax,
        total_before_discount: order.total,
        discount_amount: order.discount_amount,
        final_amount: order.final_amount,
        amount_paid: transaction.amount,
        transaction_id: transaction.transaction_id,
        transaction_type: 'TicketBooking',
        payment_status: transaction.status,
        reference_number: transaction.reference_number,
        stripe_payment_intent_id: paymentIntent.paymentIntentId
      }
    }, 'Payment intent created successfully. Use client_secret to complete payment on frontend.', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Confirm payment for event entry tickets order
 * Confirms the Stripe payment intent and updates transaction status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const confirmPayment = asyncHandler(async (req, res) => {
  try {
    const { payment_intent_id, payment_method_id } = req.body;

    if (!payment_intent_id) {
      return sendError(res, 'Payment intent ID is required', 400);
    }

    // Find the transaction by payment intent ID
    const transaction = await Transaction.findOne({
      reference_number: payment_intent_id,
      user_id: req.userId
    });

    if (!transaction) {
      return sendNotFound(res, 'Transaction not found for this payment intent');
    }

    // Confirm payment intent with Stripe
    let confirmedPayment = null;
    try {
      confirmedPayment = await confirmPaymentIntent(payment_intent_id, payment_method_id);
    } catch (confirmError) {
      console.error('Payment confirmation error:', confirmError);
      return sendError(res, `Payment confirmation failed: ${confirmError.message}`, 400);
    }

    // Update transaction status based on Stripe response
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { reference_number: payment_intent_id },
      {
        status: confirmedPayment.status === 'succeeded' ? 'completed' : 'failed',
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    // Update order status if payment succeeded
    if (confirmedPayment.status === 'succeeded') {
      await EventEntryTicketsOrder.findOneAndUpdate(
        { event_entry_tickets_order_id: transaction.metadata.order_id },
        { 
          updatedBy: req.userId,
          updatedAt: new Date()
        }
      );
    }

    sendSuccess(res, {
      paymentIntent: confirmedPayment,
      transaction: updatedTransaction,
      payment_status: confirmedPayment.status === 'succeeded' ? 'completed' : 'failed'
    }, `Payment ${confirmedPayment.status === 'succeeded' ? 'confirmed successfully' : 'confirmation failed'}`, 200);
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createEventEntryTicketsOrder,
  getAllEventEntryTicketsOrders,
  getEventEntryTicketsOrderById,
  getEventEntryTicketsOrdersByAuth,
  updateEventEntryTicketsOrder,
  deleteEventEntryTicketsOrder,
  processPayment,
  confirmPayment
};

