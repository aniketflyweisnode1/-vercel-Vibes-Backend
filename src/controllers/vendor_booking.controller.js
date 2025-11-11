const VendorBooking = require('../models/vendor_booking.model');
const Event = require('../models/event.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const { createPaymentIntent, createCustomer } = require('../../utils/stripe');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ALLOWED_VENDOR_BOOKING_STATUS = ['pending', 'confirmed', 'cancelled', 'rescheduled'];

/**
 * Normalize date inputs
 */
const parseDateOrNull = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${fieldName} value`);
  }
  return parsed;
};

/**
 * Create vendor booking
 */
const createVendorBooking = asyncHandler(async (req, res) => {
  try {
    const startDate = parseDateOrNull(req.body.Date_start, 'Date_start');
    if (!startDate) {
      return sendError(res, 'Date_start is required', 400);
    }

    const endDate = parseDateOrNull(req.body.End_date, 'End_date');

    const bookingData = {
      ...req.body,
      user_id: req.body.user_id || req.userId,
      Date_start: startDate,
      End_date: endDate,
      Start_time: req.body.Start_time === '' ? null : req.body.Start_time || null,
      End_time: req.body.End_time === '' ? null : req.body.End_time || null,
      Vendor_Category_id: Array.isArray(req.body.Vendor_Category_id)
        ? req.body.Vendor_Category_id
        : [],
      Status: req.body.Status !== undefined ? req.body.Status : true,
      CreateBy: req.userId,
      CreateAt: new Date(),
      UpdatedBy: null,
      UpdatedAt: new Date()
    };

    bookingData.Year = bookingData.Year || startDate.getFullYear();
    bookingData.Month = bookingData.Month || (startDate.getMonth() + 1);

    const rawStatus = bookingData.vender_booking_status ?? bookingData.vendor_booking_status;
    if (rawStatus !== undefined && rawStatus !== null && rawStatus !== '') {
      const normalizedStatus = String(rawStatus).toLowerCase();
      if (!ALLOWED_VENDOR_BOOKING_STATUS.includes(normalizedStatus)) {
        return sendError(res, `vender_booking_status must be one of: ${ALLOWED_VENDOR_BOOKING_STATUS.join(', ')}`, 400);
      }
      bookingData.vender_booking_status = normalizedStatus;
    } else {
      bookingData.vender_booking_status = 'pending';
    }
    delete bookingData.vendor_booking_status;

    const booking = await VendorBooking.create(bookingData);
    sendSuccess(res, booking, 'Vendor booking created successfully', 201);
  } catch (error) {
    if (error.message.startsWith('Invalid')) {
      return sendError(res, error.message, 400);
    }
    throw error;
  }
});

/**
 * Get all vendor bookings
 */
const getAllVendorBookings = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      user_id,
      Year,
      Month,
      Date_start,
      End_date,
      Start_time,
      End_time,
      Event_id,
      User_availabil,
      vender_booking_status,
      vendor_booking_status,
      Status
    } = req.query;

    const filter = {};

    if (user_id) {
      filter.user_id = parseInt(user_id, 10);
    }
    if (Year) {
      filter.Year = parseInt(Year, 10);
    }
    if (Month) {
      filter.Month = parseInt(Month, 10);
    }
    if (Date_start) {
      const parsedStart = parseDateOrNull(Date_start, 'Date_start');
      if (parsedStart) {
        filter.Date_start = parsedStart;
      }
    }
    if (End_date) {
      const parsedEnd = parseDateOrNull(End_date, 'End_date');
      if (parsedEnd) {
        filter.End_date = parsedEnd;
      }
    }
    if (Start_time) {
      filter.Start_time = Start_time;
    }
    if (End_time) {
      filter.End_time = End_time;
    }
    if (Event_id) {
      filter.Event_id = parseInt(Event_id, 10);
    }
    if (User_availabil) {
      filter.User_availabil = User_availabil;
    }
    if (Status !== undefined) {
      filter.Status = Status === 'true';
    }
    const statusFilter = vender_booking_status ?? vendor_booking_status;
    if (statusFilter) {
      const normalizedStatus = String(statusFilter).toLowerCase();
      if (ALLOWED_VENDOR_BOOKING_STATUS.includes(normalizedStatus)) {
        filter.vender_booking_status = normalizedStatus;
      }
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      VendorBooking.find(filter)
        .sort({ Date_start: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      VendorBooking.countDocuments(filter)
    ]);

    const populatedBookings = await Promise.all(bookings.map(async (booking) => {
      const bookingObj = booking.toObject();

      if (booking.user_id) {
        try {
          const user = await User.findOne({ user_id: booking.user_id }).select('user_id name email mobile');
          bookingObj.user_details = user || null;
        } catch (error) {
          bookingObj.user_details = null;
        }
      }

      if (booking.user_id) {
        try {
          const user = await User.findOne({ user_id: booking.user_id }).select('user_id name email mobile');
          bookingObj.user_details = user || null;
        } catch (error) {
          bookingObj.user_details = null;
        }
      }

      if (booking.Event_id) {
        try {
          const event = await Event.findOne({ event_id: booking.Event_id });
          bookingObj.event_details = event || null;
        } catch (error) {
          bookingObj.event_details = null;
        }
      }

      if (booking.Vendor_Category_id && booking.Vendor_Category_id.length) {
        try {
          const categories = await Category.find({ category_id: { $in: booking.Vendor_Category_id } });
          bookingObj.vendor_category_details = categories;
        } catch (error) {
          bookingObj.vendor_category_details = [];
        }
      }

      if (booking.CreateBy) {
        try {
          const createdByUser = await User.findOne({ user_id: booking.CreateBy }).select('user_id name email');
          bookingObj.created_by_details = createdByUser || null;
        } catch (error) {
          bookingObj.created_by_details = null;
        }
      }

      if (booking.UpdatedBy) {
        try {
          const updatedByUser = await User.findOne({ user_id: booking.UpdatedBy }).select('user_id name email');
          bookingObj.updated_by_details = updatedByUser || null;
        } catch (error) {
          bookingObj.updated_by_details = null;
        }
      }

      return bookingObj;
    }));

    const pagination = {
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    };

    sendPaginated(res, populatedBookings, pagination, 'Vendor bookings retrieved successfully');
  } catch (error) {
    if (error.message.startsWith('Invalid')) {
      return sendError(res, error.message, 400);
    }
    throw error;
  }
});

/**
 * Get vendor booking by ID
 */
const getVendorBookingById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await VendorBooking.findOne({
      Vendor_Booking_id: parseInt(id, 10)
    });

    if (!booking) {
      return sendNotFound(res, 'Vendor booking not found');
    }

    const bookingObj = booking.toObject();

    if (booking.user_id) {
      const user = await User.findOne({ user_id: booking.user_id }).select('user_id name email mobile');
      bookingObj.user_details = user || null;
    }

    if (booking.Event_id) {
      const event = await Event.findOne({ event_id: booking.Event_id });
      bookingObj.event_details = event || null;
    }

    if (booking.Vendor_Category_id && booking.Vendor_Category_id.length) {
      const categories = await Category.find({ category_id: { $in: booking.Vendor_Category_id } });
      bookingObj.vendor_category_details = categories;
    }

    if (booking.CreateBy) {
      const createdByUser = await User.findOne({ user_id: booking.CreateBy }).select('user_id name email');
      bookingObj.created_by_details = createdByUser || null;
    }

    if (booking.UpdatedBy) {
      const updatedByUser = await User.findOne({ user_id: booking.UpdatedBy }).select('user_id name email');
      bookingObj.updated_by_details = updatedByUser || null;
    }

    sendSuccess(res, bookingObj, 'Vendor booking retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vendor booking
 */
const updateVendorBooking = asyncHandler(async (req, res) => {
  try {
    const { Vendor_Booking_id, ...updateBody } = req.body;

    const booking = await VendorBooking.findOne({
      Vendor_Booking_id: parseInt(Vendor_Booking_id, 10)
    });

    if (!booking) {
      return sendNotFound(res, 'Vendor booking not found');
    }

    const updateData = {
      ...updateBody,
      UpdatedBy: req.userId,
      UpdatedAt: new Date()
    };

    if (updateData.Date_start !== undefined) {
      updateData.Date_start = parseDateOrNull(updateData.Date_start, 'Date_start');
    }

    if (updateData.End_date !== undefined) {
      updateData.End_date = parseDateOrNull(updateData.End_date, 'End_date');
    }

    if (updateData.Start_time !== undefined && updateData.Start_time === '') {
      updateData.Start_time = null;
    }
    if (updateData.End_time !== undefined && updateData.End_time === '') {
      updateData.End_time = null;
    }

    if (updateData.Vendor_Category_id !== undefined && !Array.isArray(updateData.Vendor_Category_id)) {
      updateData.Vendor_Category_id = [];
    }

    if (updateData.Date_start) {
      updateData.Year = updateData.Year || updateData.Date_start.getFullYear();
      updateData.Month = updateData.Month || (updateData.Date_start.getMonth() + 1);
    }

    if (Object.prototype.hasOwnProperty.call(updateData, 'vender_booking_status') || Object.prototype.hasOwnProperty.call(updateData, 'vendor_booking_status')) {
      const rawStatus = updateData.vender_booking_status ?? updateData.vendor_booking_status;
      if (rawStatus === null || rawStatus === '' || rawStatus === undefined) {
        delete updateData.vender_booking_status;
      } else {
        const normalizedStatus = String(rawStatus).toLowerCase();
        if (!ALLOWED_VENDOR_BOOKING_STATUS.includes(normalizedStatus)) {
          return sendError(res, `vender_booking_status must be one of: ${ALLOWED_VENDOR_BOOKING_STATUS.join(', ')}`, 400);
        }
        updateData.vender_booking_status = normalizedStatus;
      }
      delete updateData.vendor_booking_status;
    }

    const updatedBooking = await VendorBooking.findOneAndUpdate(
      { Vendor_Booking_id: parseInt(Vendor_Booking_id, 10) },
      updateData,
      { new: true, runValidators: true }
    );

    sendSuccess(res, updatedBooking, 'Vendor booking updated successfully');
  } catch (error) {
    if (error.message.startsWith('Invalid')) {
      return sendError(res, error.message, 400);
    }
    throw error;
  }
});

/**
 * Delete vendor booking (soft delete)
 */
const deleteVendorBooking = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await VendorBooking.findOne({
      Vendor_Booking_id: parseInt(id, 10)
    });

    if (!booking) {
      return sendNotFound(res, 'Vendor booking not found');
    }

    const deletedBooking = await VendorBooking.findOneAndUpdate(
      { Vendor_Booking_id: parseInt(id, 10) },
      {
        Status: false,
        UpdatedBy: req.userId,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    sendSuccess(res, deletedBooking, 'Vendor booking deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vendor bookings for authenticated user
 */
const getVendorBookingsByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      Date_start,
      End_date,
      Start_time,
      End_time,
      Event_id,
      User_availabil,
      vender_booking_status,
      vendor_booking_status,
      Status
    } = req.query;

    const filter = {
      user_id: req.userId
    };

    if (Date_start) {
      const parsedStart = parseDateOrNull(Date_start, 'Date_start');
      if (parsedStart) {
        filter.Date_start = parsedStart;
      }
    }
    if (End_date) {
      const parsedEnd = parseDateOrNull(End_date, 'End_date');
      if (parsedEnd) {
        filter.End_date = parsedEnd;
      }
    }
    if (Start_time) {
      filter.Start_time = Start_time;
    }
    if (End_time) {
      filter.End_time = End_time;
    }
    if (Event_id) {
      filter.Event_id = parseInt(Event_id, 10);
    }
    if (User_availabil) {
      filter.User_availabil = User_availabil;
    }
    if (Status !== undefined) {
      filter.Status = Status === 'true';
    }
    const statusFilter = vender_booking_status ?? vendor_booking_status;
    if (statusFilter) {
      const normalizedStatus = String(statusFilter).toLowerCase();
      if (ALLOWED_VENDOR_BOOKING_STATUS.includes(normalizedStatus)) {
        filter.vender_booking_status = normalizedStatus;
      }
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      VendorBooking.find(filter)
        .sort({ Date_start: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      VendorBooking.countDocuments(filter)
    ]);

    const populatedBookings = await Promise.all(bookings.map(async (booking) => {
      const bookingObj = booking.toObject();

      if (booking.Event_id) {
        try {
          const event = await Event.findOne({ event_id: booking.Event_id });
          bookingObj.event_details = event || null;
        } catch (error) {
          bookingObj.event_details = null;
        }
      }

      if (booking.Vendor_Category_id && booking.Vendor_Category_id.length) {
        try {
          const categories = await Category.find({ category_id: { $in: booking.Vendor_Category_id } });
          bookingObj.vendor_category_details = categories;
        } catch (error) {
          bookingObj.vendor_category_details = [];
        }
      }

      if (booking.CreateBy) {
        try {
          const createdByUser = await User.findOne({ user_id: booking.CreateBy }).select('user_id name email');
          bookingObj.created_by_details = createdByUser || null;
        } catch (error) {
          bookingObj.created_by_details = null;
        }
      }

      if (booking.UpdatedBy) {
        try {
          const updatedByUser = await User.findOne({ user_id: booking.UpdatedBy }).select('user_id name email');
          bookingObj.updated_by_details = updatedByUser || null;
        } catch (error) {
          bookingObj.updated_by_details = null;
        }
      }

      return bookingObj;
    }));

    const pagination = {
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    };

    sendPaginated(res, populatedBookings, pagination, 'Vendor bookings retrieved successfully for authenticated user');
  } catch (error) {
    if (error.message.startsWith('Invalid')) {
      return sendError(res, error.message, 400);
    }
    throw error;
  }
});

/**
 * Staff booking payment logged as transaction
 */
const StaffBookingPayment = asyncHandler(async (req, res) => {
  try {
    const {
      vendor_booking_id,
      payment_method_id,
      billingDetails,
      description = 'Vendor booking payment'
    } = req.body;

    if (!vendor_booking_id || !payment_method_id) {
      return sendError(res, 'vendor_booking_id and payment_method_id are required', 400);
    }

    const booking = await VendorBooking.findOne({
      Vendor_Booking_id: parseInt(vendor_booking_id, 10),
      Status: true
    });

    if (!booking) {
      return sendNotFound(res, 'Vendor booking not found or inactive');
    }

    const user = await User.findOne({ user_id: req.userId });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const amount = Number(booking.amount || booking.pricing || booking.total_price || 0);
    if (!amount || amount <= 0) {
      return sendError(res, 'Booking amount must be greater than 0', 400);
    }

    let customerId = null;
    try {
      const customerData = {
        email: user.email,
        name: user.name,
        phone: user.mobile,
        metadata: {
          user_id: req.userId,
          vendor_booking_id
        }
      };

      const customer = await createCustomer(customerData);
      customerId = customer.customerId;
    } catch (customerError) {
      console.error('Customer creation error:', customerError);
    }

    let paymentIntent = null;
    try {
      const paymentOptions = {
        amount: Math.round(amount * 100),
        billingDetails,
        currency: 'usd',
        customerEmail: user.email,
        metadata: {
          user_id: req.userId,
          customer_id: customerId,
          vendor_booking_id,
          payment_type: 'vendor_booking',
          description
        }
      };

      paymentIntent = await createPaymentIntent(paymentOptions);
    } catch (paymentError) {
      console.error('Payment intent creation error:', paymentError);
      return sendError(res, `Payment intent creation failed: ${paymentError.message}`, 400);
    }

    const transactionData = {
      user_id: req.userId,
      amount,
      currency: 'USD',
      status: paymentIntent.status,
      payment_method_id,
      transactionType: 'VendorBooking',
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
        vendor_booking_id,
        description
      }),
      created_by: req.userId
    };

    const transaction = await Transaction.create(transactionData);

    const updatedBooking = await VendorBooking.findOneAndUpdate(
      { Vendor_Booking_id: parseInt(vendor_booking_id, 10) },
      {
        transaction_id: transaction.transaction_id,
        vender_booking_status: 'confirmed',
        UpdatedBy: req.userId,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    sendSuccess(res, {
      transaction_id: transaction.transaction_id,
      payment_intent_id: paymentIntent.paymentIntentId,
      client_secret: paymentIntent.clientSecret,
      amount,
      currency: 'USD',
      status: paymentIntent.status,
      customer_id: customerId,
      vendor_booking_id,
      vendor_booking: {
        id: updatedBooking.Vendor_Booking_id,
        transaction_id: updatedBooking.transaction_id,
        vender_booking_status: updatedBooking.vender_booking_status
      },
      message: 'Vendor booking payment processed successfully'
    }, 'Vendor booking payment processed successfully');
  } catch (error) {
    console.error('Vendor booking payment error:', error);
    throw error;
  }
});

module.exports = {
  createVendorBooking,
  getAllVendorBookings,
  getVendorBookingById,
  updateVendorBooking,
  deleteVendorBooking,
  getVendorBookingsByAuth,
  StaffBookingPayment
};

