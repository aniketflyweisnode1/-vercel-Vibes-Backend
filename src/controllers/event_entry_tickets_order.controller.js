const EventEntryTicketsOrder = require('../models/event_entry_tickets_order.model');
const EventEntryUsergetTickets = require('../models/event_entry_userget_tickets.model');
const EventEntryTickets = require('../models/event_entry_tickets.model');
const Ticket = require('../models/ticket.model');
const Event = require('../models/event.model');
const Transaction = require('../models/transaction.model');
const CouponCode = require('../models/coupon_code.model');
const User = require('../models/user.model');
const VenueDetails = require('../models/venue_details.model');
const Country = require('../models/country.model');
const State = require('../models/state.model');
const City = require('../models/city.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { createPaymentIntent, createCustomer, confirmPaymentIntent, verifyPaymentStatus, getPaymentIntentById } = require('../../utils/stripe');
const PaymentMethods = require('../models/payment_methods.model');
const emailService = require('../../utils/emailService');
const logger = require('../../utils/logger');
/**
 * Create a new event entry tickets order
 * Automatically finds purchase by event_id and authenticated user
 * Automatically calculates quantity, price, tax, subtotal, and total
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEventEntryTicketsOrder = asyncHandler(async (req, res) => {
  try {
    const { event_id, coupon_code, seats } = req.body;

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
      return sendNotFound(res, `No ticket purchase found for event ID ${event_id} by the authenticated user. Please create a ticket purchase first using /api/master/event-entry-userget-tickets/create`);
    }

    // Check if tickets array exists
    if (!usergetTicket.tickets || usergetTicket.tickets.length === 0) {
      return sendError(res, 'No tickets found in the purchase record', 400);
    }

    // Calculate total quantity and subtotal by processing all tickets
    let totalQuantity = 0;
    let subtotal = 0;
    const ticketBreakdown = [];
    const ticketsToUpdate = []; // Store tickets that need seat updates

    for (const ticket of usergetTicket.tickets) {
      // Auto-populate event_entry_tickets_id if not provided
      let eventEntryTicketsId = ticket.event_entry_tickets_id;

      if (!eventEntryTicketsId || eventEntryTicketsId === null || eventEntryTicketsId === undefined) {
        // Try to find the first active event entry ticket for this event
        try {
          const eventEntryTicket = await EventEntryTickets.findOne({
            event_id: parseInt(event_id),
            status: true
          }).sort({ createdAt: -1 });

          if (eventEntryTicket) {
            eventEntryTicketsId = eventEntryTicket.event_entry_tickets_id;
            // Update the ticket in the usergetTicket for future reference
            ticket.event_entry_tickets_id = eventEntryTicketsId;
          } else {
            return sendNotFound(res, `No active event entry tickets found for event ID: ${event_id}`);
          }
        } catch (error) {
          console.error('Error auto-populating event_entry_tickets_id:', error);
          return sendError(res, 'Failed to find ticket. Please ensure tickets are available for this event.', 400);
        }
      }

      // Get the event entry ticket directly from EventEntryTickets model
      const eventEntryTicket = await EventEntryTickets.findOne({
        event_entry_tickets_id: parseInt(eventEntryTicketsId),
        event_id: parseInt(event_id),
        status: true
      });

      if (!eventEntryTicket) {
        return sendNotFound(res, `Event entry ticket not found for ID: ${eventEntryTicketsId} for event ID: ${event_id}`);
      }

      // Check if enough seats are available
      if (eventEntryTicket.total_seats < ticket.quantity) {
        return sendError(res, `Not enough seats available. Only ${eventEntryTicket.total_seats} seats available for ticket ID: ${eventEntryTicketsId}`, 400);
      }

      const itemQuantity = ticket.quantity;
      const itemPrice = eventEntryTicket.price;
      const itemSubtotal = itemQuantity * itemPrice;

      totalQuantity += itemQuantity;
      subtotal += itemSubtotal;

      // Store ticket info for seat update
      ticketsToUpdate.push({
        event_entry_tickets_id: eventEntryTicketsId,
        quantity: itemQuantity
      });

      ticketBreakdown.push({
        event_entry_tickets_id: eventEntryTicketsId,
        ticket_title: eventEntryTicket.title || `Ticket ${eventEntryTicketsId}`,
        quantity: itemQuantity,
        price_per_ticket: itemPrice,
        item_subtotal: itemSubtotal
      });
    }

    // Calculate tax (default 0% if not provided)
    const taxAmount = 0;
    const PlatformFee = (subtotal * 7) / 100;
    // Calculate total before discount
    const total = subtotal + PlatformFee;

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

    // Process seats field to ensure it's an array of strings
    const processSeatsField = (seatsField) => {
      if (!seatsField) return [];
      if (Array.isArray(seatsField)) {
        return seatsField.map(seat => String(seat).trim()).filter(seat => seat.length > 0);
      }
      if (typeof seatsField === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(seatsField);
          if (Array.isArray(parsed)) {
            return parsed.map(seat => String(seat).trim()).filter(seat => seat.length > 0);
          }
          return [String(seatsField).trim()].filter(seat => seat.length > 0);
        } catch {
          // If not JSON, treat as comma-separated string
          return seatsField.split(',').map(seat => String(seat).trim()).filter(seat => seat.length > 0);
        }
      }
      return [];
    };

    const processedSeats = processSeatsField(seats);

    // Validate seats count matches quantity (optional validation)
    if (processedSeats.length > 0 && processedSeats.length !== totalQuantity) {
      console.warn(`Warning: Seats count (${processedSeats.length}) does not match total quantity (${totalQuantity})`);
      // You can uncomment the line below to enforce strict validation
      // return sendError(res, `Seats count (${processedSeats.length}) must match total quantity (${totalQuantity})`, 400);
    }

    // Create order data
    const orderData = {
      event_entry_userget_tickets_id: usergetTicket.event_entry_userget_tickets_id,
      event_id: parseInt(event_id),
      quantity: totalQuantity,
      price: subtotal / totalQuantity, // Average price
      subtotal: subtotal,
      tax: taxAmount,
      Platform: PlatformFee,
      total: total,
      coupon_code_id: couponCodeId,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      createdBy: req.userId,
      seats: processedSeats
    };

    const order = await EventEntryTicketsOrder.create(orderData);

    // Update seats for each ticket after order creation
    try {
      for (const ticketUpdate of ticketsToUpdate) {
        await EventEntryTickets.findOneAndUpdate(
          { event_entry_tickets_id: ticketUpdate.event_entry_tickets_id },
          {
            $inc: { total_seats: -ticketUpdate.quantity },
            updatedBy: req.userId,
            updatedAt: new Date()
          },
          { new: true }
        );
        console.log(`Updated seats for ticket ID ${ticketUpdate.event_entry_tickets_id}: decremented ${ticketUpdate.quantity} seats`);
      }
    } catch (seatUpdateError) {
      // Log error but don't fail the order creation
      console.error('Error updating seats after order creation:', seatUpdateError);
      // Note: In production, you might want to implement a rollback mechanism here
    }

    sendSuccess(res, {
      ...order.toObject(),
      calculation_details: {
        total_quantity: totalQuantity,
        ticket_breakdown: ticketBreakdown,
        subtotal: subtotal,
        tax_percentage: 0,
        tax_amount: taxAmount,
        Platformfee: PlatformFee,
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

    if (status !== undefined) {
      filter.status = status === 'true';
    }
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

    // Populate related fields
    const populatedOrders = await Promise.all(orders.map(async (order) => {
      const orderObj = order.toObject();

      // Populate createdBy
      if (order.createdBy) {
        try {
          const createdByUser = await User.findOne({ user_id: order.createdBy });
          orderObj.createdBy = createdByUser;
        } catch (error) {
          console.log('User not found for createdBy ID:', order.createdBy);
        }
      }

      // Populate updatedBy
      if (order.updatedBy) {
        try {
          const updatedByUser = await User.findOne({ user_id: order.updatedBy });
          orderObj.updatedBy = updatedByUser;
        } catch (error) {
          console.log('User not found for updatedBy ID:', order.updatedBy);
        }
      }

      // Populate event
      if (order.event_id) {
        try {
          const event = await Event.findOne({ event_id: order.event_id });
          orderObj.event = event;
        } catch (error) {
          console.log('Event not found for ID:', order.event_id);
        }
      }

      // Populate event_entry_userget_tickets
      if (order.event_entry_userget_tickets_id) {
        try {
          const usergetTicket = await EventEntryUsergetTickets.findOne({
            event_entry_userget_tickets_id: order.event_entry_userget_tickets_id
          });
          orderObj.event_entry_userget_tickets = usergetTicket;
        } catch (error) {
          console.log('EventEntryUsergetTickets not found for ID:', order.event_entry_userget_tickets_id);
        }
      }

      // Check payment status
      try {
        const transactions = await Transaction.find({
          transactionType: 'TicketBooking',
          status: 'completed'
        });

        let paymentStatus = 'pending';
        let transaction = null;

        for (const txn of transactions) {
          if (txn.metadata) {
            try {
              const metadata = JSON.parse(txn.metadata);
              if (metadata.order_id === order.event_entry_tickets_order_id) {
                transaction = txn;
                paymentStatus = 'completed';
                break;
              }
            } catch (e) {
              // Skip if metadata parsing fails
            }
          }
        }

        orderObj.payment_status = paymentStatus;
        orderObj.transaction = transaction ? {
          transaction_id: transaction.transaction_id,
          status: transaction.status,
          amount: transaction.amount,
          transaction_date: transaction.transaction_date,
          reference_number: transaction.reference_number
        } : null;
      } catch (error) {
        orderObj.payment_status = 'unknown';
        orderObj.transaction = null;
      }

      return orderObj;
    }));

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, populatedOrders, pagination, 'Event entry tickets orders retrieved successfully');
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

    const orderObj = order.toObject();

    // Populate createdBy
    if (order.createdBy) {
      try {
        const createdByUser = await User.findOne({ user_id: order.createdBy });
        orderObj.createdBy = createdByUser;
      } catch (error) {
        console.log('User not found for createdBy ID:', order.createdBy);
      }
    }

    // Populate updatedBy
    if (order.updatedBy) {
      try {
        const updatedByUser = await User.findOne({ user_id: order.updatedBy });
        orderObj.updatedBy = updatedByUser;
      } catch (error) {
        console.log('User not found for updatedBy ID:', order.updatedBy);
      }
    }

    // Populate event
    if (order.event_id) {
      try {
        const event = await Event.findOne({ event_id: order.event_id });
        orderObj.event = event;
      } catch (error) {
        console.log('Event not found for ID:', order.event_id);
      }
    }

    // Populate event_entry_userget_tickets
    if (order.event_entry_userget_tickets_id) {
      try {
        const usergetTicket = await EventEntryUsergetTickets.findOne({
          event_entry_userget_tickets_id: order.event_entry_userget_tickets_id
        });
        orderObj.event_entry_userget_tickets = usergetTicket;
      } catch (error) {
        console.log('EventEntryUsergetTickets not found for ID:', order.event_entry_userget_tickets_id);
      }
    }

    // Check payment status
    try {
      const transactions = await Transaction.find({
        transactionType: 'TicketBooking',
        status: 'completed'
      });

      let paymentStatus = 'pending';
      let transaction = null;

      for (const txn of transactions) {
        if (txn.metadata) {
          try {
            const metadata = JSON.parse(txn.metadata);
            if (metadata.order_id === order.event_entry_tickets_order_id) {
              transaction = txn;
              paymentStatus = 'completed';
              break;
            }
          } catch (e) {
            // Skip if metadata parsing fails
          }
        }
      }

      orderObj.payment_status = paymentStatus;
      orderObj.transaction = transaction ? {
        transaction_id: transaction.transaction_id,
        status: transaction.status,
        amount: transaction.amount,
        transaction_date: transaction.transaction_date,
        reference_number: transaction.reference_number
      } : null;
    } catch (error) {
      orderObj.payment_status = 'unknown';
      orderObj.transaction = null;
    }

    sendSuccess(res, orderObj, 'Event entry tickets order retrieved successfully');
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

    if (status !== undefined) {
      filter.status = status === 'true';
    }
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

    // Populate related fields
    const populatedOrders = await Promise.all(orders.map(async (order) => {
      const orderObj = order.toObject();

      // Populate event
      if (order.event_id) {
        try {
          const event = await Event.findOne({ event_id: order.event_id });
          orderObj.event = event;
        } catch (error) {
          console.log('Event not found for ID:', order.event_id);
        }
      }

      // Populate event_entry_userget_tickets
      if (order.event_entry_userget_tickets_id) {
        try {
          const usergetTicket = await EventEntryUsergetTickets.findOne({
            event_entry_userget_tickets_id: order.event_entry_userget_tickets_id
          });
          orderObj.event_entry_userget_tickets = usergetTicket;
        } catch (error) {
          console.log('EventEntryUsergetTickets not found for ID:', order.event_entry_userget_tickets_id);
        }
      }

      // Check payment status
      try {
        const transactions = await Transaction.find({
          transactionType: 'TicketBooking',
          status: 'completed',
          user_id: req.userId
        });

        let paymentStatus = 'pending';
        let transaction = null;

        for (const txn of transactions) {
          if (txn.metadata) {
            try {
              const metadata = JSON.parse(txn.metadata);
              if (metadata.order_id === order.event_entry_tickets_order_id) {
                transaction = txn;
                paymentStatus = 'completed';
                break;
              }
            } catch (e) {
              // Skip if metadata parsing fails
            }
          }
        }

        orderObj.payment_status = paymentStatus;
        orderObj.transaction = transaction ? {
          transaction_id: transaction.transaction_id,
          status: transaction.status,
          amount: transaction.amount,
          transaction_date: transaction.transaction_date,
          reference_number: transaction.reference_number
        } : null;
      } catch (error) {
        orderObj.payment_status = 'unknown';
        orderObj.transaction = null;
      }

      return orderObj;
    }));

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, populatedOrders, pagination, 'User event entry tickets orders retrieved successfully');
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
    const { id, seats, ...updateFields } = req.body;

    // Find existing order
    const existingOrder = await EventEntryTicketsOrder.findOne({
      event_entry_tickets_order_id: parseInt(id)
    });

    if (!existingOrder) {
      return sendNotFound(res, 'Event entry tickets order not found');
    }

    // Process seats field if provided
    if (seats !== undefined) {
      const processSeatsField = (seatsField) => {
        if (!seatsField) return [];
        if (Array.isArray(seatsField)) {
          return seatsField.map(seat => String(seat).trim()).filter(seat => seat.length > 0);
        }
        if (typeof seatsField === 'string') {
          try {
            const parsed = JSON.parse(seatsField);
            if (Array.isArray(parsed)) {
              return parsed.map(seat => String(seat).trim()).filter(seat => seat.length > 0);
            }
            return [String(seatsField).trim()].filter(seat => seat.length > 0);
          } catch {
            return seatsField.split(',').map(seat => String(seat).trim()).filter(seat => seat.length > 0);
          }
        }
        return [];
      };

      updateFields.seats = processSeatsField(seats);

      // Validate seats count matches quantity if both are provided
      if (updateFields.seats.length > 0 && updateFields.quantity &&
        updateFields.seats.length !== updateFields.quantity) {
        console.warn(`Warning: Seats count (${updateFields.seats.length}) does not match quantity (${updateFields.quantity})`);
      }
    }

    updateFields.updatedBy = req.userId;
    updateFields.updatedAt = new Date();

    const order = await EventEntryTicketsOrder.findOneAndUpdate(
      { event_entry_tickets_order_id: parseInt(id) },
      updateFields,
      { new: true, runValidators: true }
    );

    // Populate related fields for response
    const orderObj = order.toObject();

    if (order.createdBy) {
      try {
        const createdByUser = await User.findOne({ user_id: order.createdBy });
        orderObj.createdBy = createdByUser;
      } catch (error) {
        console.log('User not found for createdBy ID:', order.createdBy);
      }
    }

    if (order.updatedBy) {
      try {
        const updatedByUser = await User.findOne({ user_id: order.updatedBy });
        orderObj.updatedBy = updatedByUser;
      } catch (error) {
        console.log('User not found for updatedBy ID:', order.updatedBy);
      }
    }

    sendSuccess(res, orderObj, 'Event entry tickets order updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete event entry tickets order
 * Restores seats when order is deleted
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEventEntryTicketsOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Find the order first to get details for seat restoration
    const order = await EventEntryTicketsOrder.findOne({
      event_entry_tickets_order_id: parseInt(id)
    });

    if (!order) {
      return sendNotFound(res, 'Event entry tickets order not found');
    }

    // Check if payment is completed - if so, prevent deletion or handle refund
    try {
      const transactions = await Transaction.find({
        transactionType: 'TicketBooking',
        status: 'completed'
      });

      for (const txn of transactions) {
        if (txn.metadata) {
          try {
            const metadata = JSON.parse(txn.metadata);
            if (metadata.order_id === parseInt(id)) {
              return sendError(res, 'Cannot delete order with completed payment. Please process a refund instead.', 400);
            }
          } catch (e) {
            // Skip if metadata parsing fails
          }
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }

    // Get userget ticket to restore seats
    try {
      const usergetTicket = await EventEntryUsergetTickets.findOne({
        event_entry_userget_tickets_id: order.event_entry_userget_tickets_id
      });

      if (usergetTicket && usergetTicket.tickets) {
        // Restore seats for each ticket type
        for (const ticket of usergetTicket.tickets) {
          if (ticket.event_entry_tickets_id) {
            try {
              await EventEntryTickets.findOneAndUpdate(
                { event_entry_tickets_id: ticket.event_entry_tickets_id },
                {
                  $inc: { total_seats: ticket.quantity },
                  updatedBy: req.userId,
                  updatedAt: new Date()
                },
                { new: true }
              );
              console.log(`Restored ${ticket.quantity} seats for ticket ID ${ticket.event_entry_tickets_id}`);
            } catch (seatRestoreError) {
              console.error('Error restoring seats:', seatRestoreError);
            }
          }
        }
      }
    } catch (restoreError) {
      console.error('Error restoring seats during order deletion:', restoreError);
      // Continue with deletion even if seat restoration fails
    }

    // Delete the order
    await EventEntryTicketsOrder.findOneAndDelete({ event_entry_tickets_order_id: parseInt(id) });

    sendSuccess(res, null, 'Event entry tickets order deleted successfully and seats restored');
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

    // Check if payment is already completed for this order
    try {
      const existingTransactions = await Transaction.find({
        transactionType: 'TicketBooking',
        status: 'completed'
      });

      // Check if any completed transaction exists for this order
      for (const txn of existingTransactions) {
        if (txn.metadata) {
          try {
            const metadata = JSON.parse(txn.metadata);
            if (metadata.order_id === parseInt(order_id)) {
              return sendError(res, 'Payment has already been completed for this order', 400);
            }
          } catch (e) {
            // Skip if metadata parsing fails
          }
        }
      }
    } catch (paymentCheckError) {
      console.error('Error checking existing payment:', paymentCheckError);
      // Continue with payment processing if check fails
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

    // Get platform fee from order.Platform field
    const PLATFORM_FEE_PERCENTAGE = 0.07; // 7% (for reference, actual fee comes from order.Platform)
    const baseAmount = order.final_amount; // Base amount (total amount customer pays)
    const platformFeeAmount = Number(order.Platform) || 0; // Platform fee from order (deducted from event host)
    const totalAmount = baseAmount; // Customer pays: final_amount (no extra)

    // Event host receives: baseAmount - platformFeeAmount (deducted from their payment)
    const eventHostAmount = baseAmount - platformFeeAmount; // Event host receives: final_amount - Platform fee

    // Get event to find event host (created_by)
    const event = await Event.findOne({ event_id: order.event_id });
    const eventHostId = event ? event.created_by : null;

    // Create Stripe payment intent
    let paymentIntent = null;
    try {
      const paymentOptions = {
        amount: totalAmount, // Customer pays: final_amount (no extra)
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

    // Create transaction data for customer
    const transactionData = {
      user_id: req.userId,
      amount: totalAmount, // Customer pays: final_amount (no extra)
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
        event_id: order.event_id,
        event_host_id: eventHostId,
        base_amount: baseAmount,
        platform_fee: platformFeeAmount,
        platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
        event_host_amount: eventHostAmount
      }),
      created_by: req.userId
    };

    // Create customer transaction
    const customerTransaction = await Transaction.create(transactionData);

    // Create event host transaction - Event host receives baseAmount minus platform fee
    if (eventHostId && eventHostAmount > 0) {
      const eventHostUser = await User.findOne({ user_id: eventHostId, status: true });

      if (eventHostUser) {
        const eventHostTransactionData = {
          user_id: eventHostId, // Event host user ID
          amount: eventHostAmount, // Event host receives: baseAmount - platformFeeAmount
          status: paymentIntent.status,
          payment_method_id: parseInt(payment_method_id, 10),
          transactionType: 'TicketBooking',
          transaction_date: new Date(),
          reference_number: `EVENT_HOST_PAYMENT_${paymentIntent.paymentIntentId}`,
          coupon_code_id: null,
          CGST: 0,
          SGST: 0,
          TotalGST: 0,
          metadata: JSON.stringify({
            payment_intent_id: paymentIntent.paymentIntentId,
            stripe_payment_intent_id: paymentIntent.paymentIntentId,
            customer_id: customerId,
            order_id: order.event_entry_tickets_order_id,
            event_id: order.event_id,
            event_host_id: eventHostId,
            customer_user_id: req.userId,
            base_amount: baseAmount,
            platform_fee: platformFeeAmount,
            platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
            event_host_amount: eventHostAmount, // Event host receives: baseAmount - platformFeeAmount
            total_amount: totalAmount,
            customer_transaction_id: customerTransaction.transaction_id,
            description: 'Event host receives base amount minus platform fee from ticket booking payment'
          }),
          created_by: req.userId
        };

        await Transaction.create(eventHostTransactionData);
      }
    }

    // Create admin transaction for platform fee only
    // Admin receives the platform fee (from order.Platform field)
    const adminUser = await User.findOne({ role_id: 1, status: true }).sort({ user_id: 1 });

    if (adminUser && platformFeeAmount > 0) {
      const adminTransactionData = {
        user_id: adminUser.user_id,
        amount: platformFeeAmount, // Admin receives platform fee (from order.Platform)
        status: paymentIntent.status,
        payment_method_id: parseInt(payment_method_id, 10),
        transactionType: 'TicketBooking',
        transaction_date: new Date(),
        reference_number: `PLATFORM_FEE_${paymentIntent.paymentIntentId}`,
        coupon_code_id: null,
        CGST: 0,
        SGST: 0,
        TotalGST: 0,
        metadata: JSON.stringify({
          payment_intent_id: paymentIntent.paymentIntentId,
          stripe_payment_intent_id: paymentIntent.paymentIntentId,
          customer_id: customerId,
          order_id: order.event_entry_tickets_order_id,
          event_id: order.event_id,
          event_host_id: eventHostId,
          customer_user_id: req.userId,
          base_amount: baseAmount,
          platform_fee: platformFeeAmount,
          platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
          event_host_amount: eventHostAmount, // Event host receives: baseAmount - platformFeeAmount
          total_amount: totalAmount,
          customer_transaction_id: customerTransaction.transaction_id,
          description: 'Platform fee (from order.Platform) deducted from event host payment - Admin receives platform fee'
        }),
        created_by: req.userId
      };

      await Transaction.create(adminTransactionData);
    }

    // Populate payment_method_id
    let populatedTransaction = customerTransaction.toObject();
    if (customerTransaction.payment_method_id) {
      try {
        const PaymentMethods = require('../models/payment_methods.model');
        const paymentMethod = await PaymentMethods.findOne({
          payment_methods_id: customerTransaction.payment_method_id
        });
        populatedTransaction.payment_method_id = paymentMethod;
      } catch (error) {
        console.log('PaymentMethod not found for ID:', customerTransaction.payment_method_id);
      }
    }

    // Update order status to mark as paid
    await EventEntryTicketsOrder.findOneAndUpdate(
      { event_entry_tickets_order_id: parseInt(order_id) },
      {
        updatedBy: req.userId,
        updatedAt: new Date()
      }
    );

    // Populate event details for email
    let populatedEvent = null;
    if (event) {
      const [venueDetails, country, state, city] = await Promise.all([
        event.venue_details_id
          ? VenueDetails.findOne({ venue_details_id: event.venue_details_id }).lean()
          : Promise.resolve(null),
        event.country_id
          ? Country.findOne({ country_id: event.country_id }).lean()
          : Promise.resolve(null),
        event.state_id
          ? State.findOne({ state_id: event.state_id }).lean()
          : Promise.resolve(null),
        event.city_id
          ? City.findOne({ city_id: event.city_id }).lean()
          : Promise.resolve(null)
      ]);

      populatedEvent = {
        ...event.toObject(),
        venue_details_id: venueDetails,
        country_id: country,
        state_id: state,
        city_id: city
      };
    }

    // Send confirmation emails to customer, admin, and event host
    const emailData = {
      order: order.toObject(),
      event: populatedEvent,
      paymentBreakdown: {
        total_amount: totalAmount,
        base_amount: baseAmount,
        platform_fee: platformFeeAmount,
        platform_fee_percentage: platformFeeAmount > 0 ? ((platformFeeAmount / baseAmount) * 100).toFixed(2) : 0,
        event_host_amount: eventHostAmount
      },
      transaction: customerTransaction.toObject()
    };

    // Send email to customer
    try {
      await emailService.sendTicketBookingPaymentEmail(
        user.email,
        emailData,
        user.name || 'User'
      );
    } catch (emailError) {
      logger.error('Failed to send ticket booking confirmation email to customer', {
        error: emailError.message,
        userEmail: user.email
      });
    }

    // Send email to admin
    try {
      if (adminUser && adminUser.email) {
        await emailService.sendTicketBookingPaymentEmail(
          adminUser.email,
          emailData,
          adminUser.name || 'Admin'
        );
      }
    } catch (emailError) {
      logger.error('Failed to send ticket booking confirmation email to admin', {
        error: emailError.message,
        adminEmail: adminUser?.email
      });
    }

    // Send email to event host (created_by)
    try {
      if (eventHostId) {
        const eventHostUser = await User.findOne({ user_id: eventHostId, status: true });
        if (eventHostUser && eventHostUser.email) {
          await emailService.sendTicketBookingPaymentEmail(
            eventHostUser.email,
            emailData,
            eventHostUser.name || 'Event Host'
          );
        }
      }
    } catch (emailError) {
      logger.error('Failed to send ticket booking confirmation email to event host', {
        error: emailError.message,
        eventHostId: eventHostId
      });
    }

    sendSuccess(res, {
      paymentIntent: {
        id: paymentIntent.paymentIntentId,
        clientSecret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      },
      transaction: populatedTransaction,
      order: order,
      customer_id: customerId,
      customer_transaction_id: customerTransaction.transaction_id,
      payment_breakdown: {
        total_amount: totalAmount, // Customer pays this (final_amount, no extra)
        base_amount: baseAmount, // Full amount (final_amount)
        platform_fee: platformFeeAmount, // Platform fee from order.Platform (deducted from event host)
        platform_fee_percentage: platformFeeAmount > 0 ? ((platformFeeAmount / baseAmount) * 100).toFixed(2) : 0, // Calculate actual percentage
        event_host_amount: eventHostAmount // Event host receives: baseAmount - platformFeeAmount
      },
      transactions: {
        customer: {
          transaction_id: customerTransaction.transaction_id,
          user_id: req.userId,
          amount: totalAmount,
          description: 'Customer payment for ticket booking (final_amount, no extra)'
        },
        event_host: {
          user_id: eventHostId,
          amount: eventHostAmount, // baseAmount - platformFeeAmount
          description: 'Event host receives base amount minus platform fee'
        },
        admin: {
          user_id: adminUser ? adminUser.user_id : null,
          amount: platformFeeAmount,
          description: 'Admin receives platform fee (from order.Platform, deducted from event host payment)'
        }
      },
      payment_summary: {
        order_id: order.event_entry_tickets_order_id,
        subtotal: order.subtotal,
        tax: order.tax,
        total_before_discount: order.total,
        discount_amount: order.discount_amount,
        base_amount: baseAmount,
        platform_fee: platformFeeAmount,
        platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
        final_amount: order.final_amount,
        amount_paid: customerTransaction.amount,
        event_host_amount: eventHostAmount,
        transaction_id: customerTransaction.transaction_id,
        transaction_type: 'TicketBooking',
        payment_status: customerTransaction.status,
        reference_number: customerTransaction.reference_number,
        stripe_payment_intent_id: paymentIntent.paymentIntentId
      }
    }, 'Ticket booking payment processed successfully. Three transactions created: Customer pays total amount, Event host receives base amount, Admin receives 7% platform fee.', 201);
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

    // Check if transaction is already completed
    if (transaction.status === 'completed') {
      return sendError(res, 'Payment has already been confirmed and completed', 400);
    }

    // Confirm payment intent with Stripe
    let confirmedPayment = null;
    try {
      confirmedPayment = await confirmPaymentIntent(payment_intent_id, payment_method_id);
    } catch (confirmError) {
      console.error('Payment confirmation error:', confirmError);

      // Check if the error is because payment is already confirmed
      if (confirmError.message.includes('already succeeded') ||
        confirmError.message.includes('already confirmed')) {
        const updatedTransaction = await Transaction.findOneAndUpdate(
          { reference_number: payment_intent_id },
          {
            status: 'completed',
            updated_by: req.userId,
            updated_at: new Date()
          },
          { new: true }
        );
        console.log("1260//////////////////////////////////////////////", updatedTransaction)
        if (updatedTransaction) {
          const updatedTransaction1 = await Transaction.findOneAndUpdate(
            { reference_number: `STAFF_PAYMENT_${payment_intent_id}` },
            {
              status: 'completed',
              updated_by: req.userId,
              updated_at: new Date()
            },
            { new: true }
          );
          console.log("1271//////////////////////////////////////////////", updatedTransaction1)

        }
        // Return success with status information instead of error
        return sendSuccess(res, {
          payment_status: 'already_confirmed',
          payment_intent_id: payment_intent_id,
          transaction: transaction,
          message: 'Payment has already been confirmed and cannot be confirmed again'
        }, 'Payment status checked - already confirmed', 200);
      }

      // For other errors, return status instead of error
      return sendSuccess(res, {
        payment_status: 'confirmation_failed',
        error_message: confirmError.message,
        payment_intent_id: payment_intent_id,
        message: 'Payment confirmation failed'
      }, 'Payment confirmation failed', 200);
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
    console.log("1260//////////////////////////////////////////////", updatedTransaction)
    if (updatedTransaction) {
      const updatedTransaction1 = await Transaction.findOneAndUpdate(
        { reference_number: `STAFF_PAYMENT_${payment_intent_id}` },
        {
          status: confirmedPayment.status === 'succeeded' ? 'completed' : 'failed',
          updated_by: req.userId,
          updated_at: new Date()
        },
        { new: true }
      );
      console.log("1271//////////////////////////////////////////////", updatedTransaction1)

    }

    // Populate payment_method_id
    let populatedTransaction = updatedTransaction.toObject();
    if (updatedTransaction.payment_method_id) {
      try {

        const paymentMethod = await PaymentMethods.findOne({
          payment_methods_id: updatedTransaction.payment_method_id
        });
        populatedTransaction.payment_method_id = paymentMethod;
      } catch (error) {
        console.log('PaymentMethod not found for ID:', updatedTransaction.payment_method_id);
      }
    }

    // Update order status if payment succeeded
    if (confirmedPayment.status === 'succeeded') {
      try {
        let orderId = null;
        if (transaction.metadata) {
          const metadata = JSON.parse(transaction.metadata);
          orderId = metadata.order_id;
        }

        if (orderId) {
          await EventEntryTicketsOrder.findOneAndUpdate(
            { event_entry_tickets_order_id: orderId },
            {
              updatedBy: req.userId,
              updatedAt: new Date()
            }
          );
        }
      } catch (error) {
        console.error('Error updating order status:', error);
      }
    }

    sendSuccess(res, {
      paymentIntent: confirmedPayment,
      transaction: populatedTransaction,
      payment_status: confirmedPayment.status === 'succeeded' ? 'completed' : 'failed'
    }, `Payment ${confirmedPayment.status === 'succeeded' ? 'confirmed successfully' : 'confirmation failed'}`, 200);
  } catch (error) {
    throw error;
  }
});

/**
 * Check payment status using client secret
 * Uses Stripe's confirmCardPayment to check payment status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkPaymentStatus = asyncHandler(async (req, res) => {
  try {
    const { payment_intent_id } = req.body;

    if (!payment_intent_id) {
      return sendError(res, 'Payment intent ID is required', 400);
    }

    // Get payment intent using stripe utility
    const paymentResult = await getPaymentIntentById(payment_intent_id);

    if (!paymentResult.success) {
      // Handle error - return status instead of error
      return sendSuccess(res, {
        payment_status: 'error',
        error_message: paymentResult.error,
        payment_intent: null,
        message: 'Payment verification failed'
      }, 'Payment status checked with error', 200);
    }

    const { paymentIntent } = paymentResult;

    if (paymentIntent.status === 'succeeded') {
      // Handle successful payment

      // Find the transaction by payment intent ID
      const transaction = await Transaction.findOne({
        reference_number: paymentIntent.id,
        user_id: req.userId
      });

      if (!transaction) {
        return sendNotFound(res, 'Transaction not found for this payment intent');
      }

      // Update transaction status to completed
      const updatedTransaction = await Transaction.findOneAndUpdate(
        { reference_number: paymentIntent.id },
        {
          status: 'completed',
          updated_by: req.userId,
          updated_at: new Date()
        },
        { new: true }
      );

      // Populate payment_method_id
      let populatedTransaction = updatedTransaction.toObject();
      if (updatedTransaction.payment_method_id) {
        try {
          const paymentMethod = await PaymentMethods.findOne({
            payment_methods_id: updatedTransaction.payment_method_id
          });
          populatedTransaction.payment_method_id = paymentMethod;
        } catch (error) {
          console.log('PaymentMethod not found for ID:', updatedTransaction.payment_method_id);
        }
      }

      // Update order status if payment succeeded
      if (transaction.metadata) {
        const metadata = JSON.parse(transaction.metadata);
        if (metadata.order_id) {
          await EventEntryTicketsOrder.findOneAndUpdate(
            { event_entry_tickets_order_id: metadata.order_id },
            {
              updatedBy: req.userId,
              updatedAt: new Date()
            }
          );
        }
      }

      sendSuccess(res, {
        payment_status: 'succeeded',
        payment_intent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          created: paymentIntent.created
        },
        transaction: populatedTransaction,
        message: 'Payment verified and confirmed successfully'
      }, 'Payment verified and confirmed successfully', 200);
    } else {
      // Payment not succeeded
      sendSuccess(res, {
        payment_status: paymentIntent ? paymentIntent.status : 'unknown',
        payment_intent: paymentIntent ? {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency
        } : null,
        message: 'Payment status checked but not succeeded'
      }, 'Payment status checked', 200);
    }
  } catch (error) {
    console.error('Payment status check error:', error);
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
  confirmPayment,
  checkPaymentStatus
};

