const MarketPlaceBooking = require('../models/marketplace_booking.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new marketplace booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createMarketPlaceBooking = asyncHandler(async (req, res) => {
  try {
    const bookingData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const booking = await MarketPlaceBooking.create(bookingData);
    sendSuccess(res, booking, 'MarketPlace Booking created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all marketplace bookings with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllMarketPlaceBooking = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      marketplace_service_charges_id,
      event_type_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { event_name: { $regex: search, $options: 'i' } },
        { event_address: { $regex: search, $options: 'i' } }
      ];
    }

  

    if (marketplace_service_charges_id) {
      filter.marketplace_service_charges_id = parseInt(marketplace_service_charges_id);
    }

    if (event_type_id) {
      filter.event_type_id = parseInt(event_type_id);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      MarketPlaceBooking.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      MarketPlaceBooking.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    };
    sendPaginated(res, bookings, pagination, 'MarketPlace Bookings retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get marketplace booking by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMarketPlaceBookingById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await MarketPlaceBooking.findOne({ marketplace_booking_id: parseInt(id) });

    if (!booking) {
      return sendNotFound(res, 'MarketPlace Booking not found');
    }
    sendSuccess(res, booking, 'MarketPlace Booking retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update marketplace booking by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateMarketPlaceBooking = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const booking = await MarketPlaceBooking.findOneAndUpdate(
      { marketplace_booking_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!booking) {
      return sendNotFound(res, 'MarketPlace Booking not found');
    }
    sendSuccess(res, booking, 'MarketPlace Booking updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete marketplace booking by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteMarketPlaceBooking = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await MarketPlaceBooking.findOneAndUpdate(
      { marketplace_booking_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return sendNotFound(res, 'MarketPlace Booking not found');
    }
    sendSuccess(res, booking, 'MarketPlace Booking deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get marketplace bookings created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMarketPlaceBookingByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {
      created_by: req.userId
    };

    if (search) {
      filter.$or = [
        { event_name: { $regex: search, $options: 'i' } },
        { event_address: { $regex: search, $options: 'i' } }
      ];
    }

  

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      MarketPlaceBooking.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      MarketPlaceBooking.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    };
    sendPaginated(res, bookings, pagination, 'User marketplace bookings retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createMarketPlaceBooking,
  getAllMarketPlaceBooking,
  getMarketPlaceBookingById,
  updateMarketPlaceBooking,
  deleteMarketPlaceBooking,
  getMarketPlaceBookingByAuth
};

