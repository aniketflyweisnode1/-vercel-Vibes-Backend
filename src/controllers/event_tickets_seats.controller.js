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

    // Ensure tickets array is properly formatted
    if (req.body.tickets && Array.isArray(req.body.tickets)) {
      seatData.tickets = req.body.tickets.map(ticket => ({
        event_entry_tickets_id: parseInt(ticket.event_entry_tickets_id || ticket.ticket_id),
        quantity: parseInt(ticket.quantity)
      })).filter(ticket => ticket.event_entry_tickets_id && ticket.quantity > 0);
    }

    // Validate required fields
    if (!seatData.event_id) {
      return sendError(res, 'Event ID is required', 400);
    }

    if (!seatData.tickets || seatData.tickets.length === 0) {
      return sendError(res, 'At least one ticket with event_entry_tickets_id and quantity is required', 400);
    }

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
    const { page = 1, limit = 10, search, status, event_id, event_entry_tickets_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNo: { $regex: search, $options: 'i' } },
        { coupon_code: { $regex: search, $options: 'i' } },
        { promo_code: { $regex: search, $options: 'i' } }
      ];
    }
  
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }
    if (event_entry_tickets_id) {
      // Filter by event_entry_tickets_id in tickets array
      const ticketId = parseInt(event_entry_tickets_id);
      filter['tickets.event_entry_tickets_id'] = ticketId;
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

    const updateData = {
      ...req.body,
      updatedBy: req.userId,
      updatedAt: new Date()
    };

    // Ensure tickets array is properly formatted if provided
    if (req.body.tickets && Array.isArray(req.body.tickets)) {
      updateData.tickets = req.body.tickets.map(ticket => ({
        event_entry_tickets_id: parseInt(ticket.event_entry_tickets_id || ticket.ticket_id),
        quantity: parseInt(ticket.quantity)
      })).filter(ticket => ticket.event_entry_tickets_id && ticket.quantity > 0);
    }

    // Remove id from updateData to avoid updating it
    delete updateData.id;

    const seat = await EventTicketsSeats.findOneAndUpdate(
      { event_tickets_seats_id: parseInt(id) },
      updateData,
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

    const seat = await EventTicketsSeats.findOne({ event_tickets_seats_id: parseInt(id) });

    if (!seat) {
      return sendNotFound(res, 'Event ticket seat not found');
    }

    // Delete the seat
    await EventTicketsSeats.findOneAndDelete({ event_tickets_seats_id: parseInt(id) });

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

