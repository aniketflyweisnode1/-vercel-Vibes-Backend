const CateringMarketplaceBooking = require('../models/catering_marketplace_booking.model');
const Event = require('../models/event.model');
const Transaction = require('../models/transaction.model');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

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
      amount
    } = req.body;

    // First create the event
    const eventData = {
      name_title: event_name,
      address: event_address,
      event_type_id: event_type_id,
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
      created_by: req.userId
    };

    const booking = await CateringMarketplaceBooking.create(bookingData);

    // Create transaction
    const transactionData = {
      user_id: req.userId,
      amount: amount || 0,
      status: 'pending',
      payment_method_id: 1, // Default payment method
      transactionType: 'CateringMarketplaceBooking',
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

module.exports = {
  createCateringMarketplaceBooking,
  getAllCateringMarketplaceBookings,
  getCateringMarketplaceBookingById,
  updateCateringMarketplaceBooking,
  deleteCateringMarketplaceBooking
};
