const EventTicketsSeats = require('../models/event_tickets_seats.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new event ticket seat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEventTicketSeat = asyncHandler(async (req, res) => {
  try {
    const seatData = {
      ...req.body,
      createdBy: req.userId
    };

    const seat = await EventTicketsSeats.create(seatData);

    sendSuccess(res, seat, 'Event ticket seat created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all event ticket seats with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEventTicketsSeats = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, event_id, event_entry_tickets_id, event_entry_userget_tickets_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNo: { $regex: search, $options: 'i' } },
        { seat_no: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }
    if (event_entry_tickets_id) {
      filter.event_entry_tickets_id = parseInt(event_entry_tickets_id);
    }
    if (event_entry_userget_tickets_id) {
      filter.event_entry_userget_tickets_id = parseInt(event_entry_userget_tickets_id);
    }

    const [seats, total] = await Promise.all([
      EventTicketsSeats.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventTicketsSeats.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, seats, pagination, 'Event ticket seats retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event ticket seat by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventTicketSeatById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const seat = await EventTicketsSeats.findOne({ event_tickets_seats_id: parseInt(id) });

    if (!seat) {
      return sendNotFound(res, 'Event ticket seat not found');
    }

    sendSuccess(res, seat, 'Event ticket seat retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update event ticket seat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventTicketSeat = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    req.body.updatedBy = req.userId;
    req.body.updatedAt = new Date();

    const seat = await EventTicketsSeats.findOneAndUpdate(
      { event_tickets_seats_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!seat) {
      return sendNotFound(res, 'Event ticket seat not found');
    }

    sendSuccess(res, seat, 'Event ticket seat updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete event ticket seat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEventTicketSeat = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const seat = await EventTicketsSeats.findOneAndDelete({ event_tickets_seats_id: parseInt(id) });

    if (!seat) {
      return sendNotFound(res, 'Event ticket seat not found');
    }

    sendSuccess(res, null, 'Event ticket seat deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createEventTicketSeat,
  getAllEventTicketsSeats,
  getEventTicketSeatById,
  updateEventTicketSeat,
  deleteEventTicketSeat
};

