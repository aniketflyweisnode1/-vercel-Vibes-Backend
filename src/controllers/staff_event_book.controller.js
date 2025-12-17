const StaffEventBook = require('../models/staff_event_book.model');
const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');
const StaffWorkingPrice = require('../models/staff_working_price.model');
const AvailabilityCalender = require('../models/availability_calender.model');
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

    // Create availability calendar entry for the booked slot
    try {
      const startDate = staffEventBook.dateFrom ? new Date(staffEventBook.dateFrom) : null;
      const endDate = staffEventBook.dateTo ? new Date(staffEventBook.dateTo) : null;

      if (startDate && !Number.isNaN(startDate.getTime())) {
        const availabilityPayload = {
          Year: startDate.getFullYear(),
          Month: startDate.getMonth() + 1,
          Date_start: startDate,
          End_date: endDate && !Number.isNaN(endDate.getTime()) ? endDate : null,
          Start_time: staffEventBook.timeFrom || null,
          End_time: staffEventBook.timeTo || null,
          user_id: staffEventBook.staff_id,
          Event_id: staffEventBook.event_id,
          User_availabil: 'Book',
          Status: true,
          CreateBy: req.userId,
          UpdatedBy: null
        };

        // Ensure Month within range in case of invalid dates
        if (availabilityPayload.Month < 1 || availabilityPayload.Month > 12) {
          availabilityPayload.Month = Math.min(Math.max(availabilityPayload.Month, 1), 12);
        }

        await AvailabilityCalender.create(availabilityPayload);
      }
    } catch (availabilityError) {
      console.error('Failed to create availability calendar entry:', availabilityError);
      // Do not fail booking if availability log fails; continue
    }

    // Try to fetch staff price based on staff_id and staff_category_id
    let staffPrice = null;
    if (staffEventBook.staff_id) {
      const priceDoc = await StaffWorkingPrice.findOne({
        staff_id: staffEventBook.staff_id,
        status: true
      });
      console.log(priceDoc);
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
 * Returns bookings where the authenticated user is the staff member being booked
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffEventBooksByAuth = asyncHandler(async (req, res) => {
  try {
    // Filter by staff_id so staff can see bookings where they are the booked staff member
    // This includes bookings created by vendors or any other users
    const staffEventBooks = await StaffEventBook.find({ staff_id: req.userId })
      .sort({ created_at: -1 });

    sendSuccess(res, staffEventBooks, 'Staff event bookings retrieved successfully');
  } catch (error) {
    throw error;
  }
});


const getStaffEventBooksByVendorAuth = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.userId;

    if (!vendorId) {
      return sendError(res, 'Vendor authentication required', 401);
    }

    // Fetch all staff members created by this vendor (role_id: 4 = staff)
    const staffUsers = await User.find({
      created_by: vendorId,
      role_id: 4,
      status: true
    }).select('user_id name email mobile role_id');

    const staffIds = staffUsers.map((staff) => staff.user_id);

    if (staffIds.length === 0) {
      return sendSuccess(res, [], 'No staff event bookings found for this vendor');
    }

    // Fetch bookings linked to vendor's staff members
    const staffEventBooks = await StaffEventBook.find({
      staff_id: { $in: staffIds }
    }).sort({ created_at: -1 }).lean();

    const staffMap = staffUsers.reduce((acc, staff) => {
      acc[staff.user_id] = staff;
      return acc;
    }, {});

    const response = staffEventBooks.map((booking) => ({
      ...booking,
      vendor_id: vendorId,
      staff_details: staffMap[booking.staff_id] || null
    }));

    sendSuccess(res, response, 'Staff event bookings retrieved successfully');
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

    // Update related availability calendar entry
    try {
      const startDate = updateData.dateFrom ? new Date(updateData.dateFrom) : (staffEventBook.dateFrom ? new Date(staffEventBook.dateFrom) : null);
      const endDate = updateData.dateTo ? new Date(updateData.dateTo) : (staffEventBook.dateTo ? new Date(staffEventBook.dateTo) : null);

      if (startDate && !Number.isNaN(startDate.getTime())) {
        const availabilityUpdate = {
          Year: startDate.getFullYear(),
          Month: startDate.getMonth() + 1,
          Date_start: startDate,
          End_date: endDate && !Number.isNaN(endDate.getTime()) ? endDate : null,
          Start_time: updateData.timeFrom !== undefined ? updateData.timeFrom || null : staffEventBook.timeFrom || null,
          End_time: updateData.timeTo !== undefined ? updateData.timeTo || null : staffEventBook.timeTo || null,
          User_availabil: updateData.User_availabil || 'Book',
          Event_id: updateData.event_id || staffEventBook.event_id,
          UpdatedBy: req.userId,
          UpdatedAt: new Date()
        };

        if (availabilityUpdate.Month < 1 || availabilityUpdate.Month > 12) {
          availabilityUpdate.Month = Math.min(Math.max(availabilityUpdate.Month, 1), 12);
        }

        await AvailabilityCalender.findOneAndUpdate(
          {
            user_id: staffEventBook.staff_id,
            Event_id: staffEventBook.event_id
          },
          availabilityUpdate,
          { upsert: true, new: true, runValidators: true }
        );
      }
    } catch (availabilityError) {
      console.error('Failed to update availability calendar entry:', availabilityError);
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

    try {
      await AvailabilityCalender.findOneAndUpdate(
        {
          user_id: staffEventBook.staff_id,
          Event_id: staffEventBook.event_id
        },
        {
          Status: false,
          UpdatedBy: req.userId,
          UpdatedAt: new Date()
        },
        { new: true }
      );
    } catch (availabilityError) {
      console.error('Failed to soft delete availability calendar entry:', availabilityError);
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
    // console.log(staffEventBook);
    // Get the staff working price for the staff and category
    const staffWorkingPrice = await StaffWorkingPrice.findOne({
      staff_id: staffEventBook.staff_id,
      status: true
    });
    // console.log(staffWorkingPrice);
    if (!staffWorkingPrice) {
      return sendNotFound(res, 'Staff working price not found for this staff and category');
    }

    const baseAmount = staffWorkingPrice.price * 0.10; // Base amount (what staff should receive)
    console.log(baseAmount);

    // Calculate 7% platform fee
    const PLATFORM_FEE_PERCENTAGE = 0.07; // 7%

    // Customer pays: baseAmount + 7% platform fee
    const customerPlatformFeeAmount = staffWorkingPrice.price * PLATFORM_FEE_PERCENTAGE;
    const totalAmount = baseAmount + customerPlatformFeeAmount; // Customer pays: base + 7% platform fee

    // Staff also pays 7% platform fee (deducted from their payment)
    const staffPlatformFeeAmount = baseAmount * PLATFORM_FEE_PERCENTAGE;
    const staffAmount = baseAmount - staffPlatformFeeAmount; // Staff receives: baseAmount - 7% platform fee

    // Total platform fee to admin: from customer + from staff
    const totalPlatformFeeAmount = customerPlatformFeeAmount + staffPlatformFeeAmount;

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
        // amount: totalAmount * 100, // Convert to cents (customer pays total)
        amount: totalAmount, // Convert to cents (customer pays total)
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

    // Create transaction data for customer
    const transactionData = {
      user_id: req.userId,
      amount: totalAmount, // Customer pays: baseAmount + 7% platform fee
      currency: 'USD',
      status: paymentIntent.status,
      payment_method_id: payment_method_id,
      transactionType: 'StaffBooking',
      staff_event_book_id: parseInt(staff_event_book_id),
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
        staff_id: staffEventBook.staff_id,
        base_amount: baseAmount,
        customer_platform_fee: customerPlatformFeeAmount, // 7% from customer
        staff_platform_fee: staffPlatformFeeAmount, // 7% from staff (deducted from staff payment)
        total_platform_fee: totalPlatformFeeAmount, // Total platform fee to admin
        platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
        staff_amount: staffAmount, // Staff receives: baseAmount - 7% platform fee
        total_amount: totalAmount,
        description: description
      }),
      created_by: req.userId
    };

    // Create customer transaction
    const customerTransaction = await Transaction.create(transactionData);

    // Create staff transaction - Staff receives baseAmount minus 7% platform fee
    const staffUser = await User.findOne({ user_id: staffEventBook.staff_id, status: true });

    if (staffUser && staffAmount > 0) {
      const staffTransactionData = {
        user_id: staffEventBook.staff_id, // Staff user ID
        amount: staffAmount, // Staff receives: baseAmount - 7% platform fee
        status: paymentIntent.status,
        payment_method_id: parseInt(payment_method_id, 10),
        transactionType: 'StaffBooking',
        staff_event_book_id: parseInt(staff_event_book_id),
        transaction_date: new Date(),
        reference_number: `STAFF_PAYMENT_${paymentIntent.paymentIntentId}`,
        coupon_code_id: null,
        CGST: 0,
        SGST: 0,
        TotalGST: 0,
        metadata: JSON.stringify({
          payment_intent_id: paymentIntent.paymentIntentId,
          stripe_payment_intent_id: paymentIntent.paymentIntentId,
          customer_id: customerId,
          staff_event_book_id: staff_event_book_id,
          staff_id: staffEventBook.staff_id,
          customer_user_id: req.userId,
          base_amount: baseAmount,
          customer_platform_fee: customerPlatformFeeAmount,
          staff_platform_fee: staffPlatformFeeAmount,
          total_platform_fee: totalPlatformFeeAmount,
          platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
          staff_amount: staffAmount, // Staff receives: baseAmount - 7% platform fee
          total_amount: totalAmount,
          customer_transaction_id: customerTransaction.transaction_id,
          description: 'Staff receives base amount minus 7% platform fee from staff booking'
        }),
        created_by: req.userId
      };

      await Transaction.create(staffTransactionData);
    }

    // Create admin transaction for platform fees
    // Admin receives: 7% from customer + 7% from staff = total platform fee
    const adminUser = await User.findOne({ role_id: 1, status: true }).sort({ user_id: 1 });

    if (adminUser && totalPlatformFeeAmount > 0) {
      const adminTransactionData = {
        user_id: adminUser.user_id,
        amount: totalPlatformFeeAmount, // Admin receives: platform fee from customer + platform fee from staff
        status: paymentIntent.status,
        payment_method_id: parseInt(payment_method_id, 10),
        transactionType: 'StaffBooking',
        staff_event_book_id: parseInt(staff_event_book_id),
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
          staff_event_book_id: staff_event_book_id,
          staff_id: staffEventBook.staff_id,
          customer_user_id: req.userId,
          base_amount: baseAmount,
          customer_platform_fee: customerPlatformFeeAmount,
          staff_platform_fee: staffPlatformFeeAmount,
          total_platform_fee: totalPlatformFeeAmount,
          platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
          staff_amount: staffAmount, // Staff receives: baseAmount - 7% platform fee
          total_amount: totalAmount,
          customer_transaction_id: customerTransaction.transaction_id,
          description: 'Platform fee (7% from customer + 7% from staff) from staff booking payment - Admin receives total platform fee'
        }),
        created_by: req.userId
      };

      await Transaction.create(adminTransactionData);
    }

    // Update the staff event booking with transaction details
    const updatedStaffEventBook = await StaffEventBook.findOneAndUpdate(
      { staff_event_book_id: parseInt(staff_event_book_id) },
      {
        transaction_id: customerTransaction.transaction_id,
        transaction_status: 'Completed',
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    sendSuccess(res, {
      customer_transaction_id: customerTransaction.transaction_id,
      payment_intent_id: paymentIntent.paymentIntentId,
      client_secret: paymentIntent.clientSecret,
      payment_breakdown: {
        total_amount: totalAmount, // Customer pays this (baseAmount + 7% platform fee)
        base_amount: baseAmount,
        customer_platform_fee: customerPlatformFeeAmount, // 7% from customer
        staff_platform_fee: staffPlatformFeeAmount, // 7% from staff (deducted from staff payment)
        total_platform_fee: totalPlatformFeeAmount, // Admin receives this (7% from customer + 7% from staff)
        platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
        staff_amount: staffAmount // Staff receives: baseAmount - 7% platform fee
      },
      transactions: {
        customer: {
          transaction_id: customerTransaction.transaction_id,
          user_id: req.userId,
          amount: totalAmount,
          description: 'Customer payment for staff booking (baseAmount + 7% platform fee)'
        },
        staff: {
          user_id: staffEventBook.staff_id,
          amount: staffAmount, // baseAmount - 7% platform fee
          description: 'Staff receives base amount minus 7% platform fee'
        },
        admin: {
          user_id: adminUser ? adminUser.user_id : null,
          amount: totalPlatformFeeAmount,
          description: 'Admin receives 7% platform fee from customer + 7% platform fee from staff'
        }
      },
      currency: 'USD',
      status: paymentIntent.status,
      paymentIntent: {
        id: paymentIntent.paymentIntentId,
        clientSecret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      },
      customer_id: customerId,
      staff_event_book_id: staff_event_book_id,
      staff_event_book: {
        id: updatedStaffEventBook.staff_event_book_id,
        transaction_id: updatedStaffEventBook.transaction_id,
        transaction_status: updatedStaffEventBook.transaction_status,
        event_name: updatedStaffEventBook.event_name,
        staff_id: updatedStaffEventBook.staff_id
      }
    }, 'Staff booking payment processed successfully. Three transactions created: Customer pays total amount, Staff receives base amount, Admin receives 7% platform fee.');

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
  StaffBookingPayment,
  getStaffEventBooksByVendorAuth
};

