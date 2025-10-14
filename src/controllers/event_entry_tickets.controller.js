const EventEntryTickets = require('../models/event_entry_tickets.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new event entry ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEventEntryTicket = asyncHandler(async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      createdBy: req.userId
    };

    const ticket = await EventEntryTickets.create(ticketData);

    sendSuccess(res, ticket, 'Event entry ticket created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all event entry tickets with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEventEntryTickets = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, event_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tag: { $regex: search, $options: 'i' } }
      ];
    }
  
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }

    const [tickets, total] = await Promise.all([
      EventEntryTickets.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventEntryTickets.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, tickets, pagination, 'Event entry tickets retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event entry ticket by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventEntryTicketById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await EventEntryTickets.findOne({ event_entry_tickets_id: parseInt(id) });

    if (!ticket) {
      return sendNotFound(res, 'Event entry ticket not found');
    }

    sendSuccess(res, ticket, 'Event entry ticket retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event entry tickets by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventEntryTicketsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, event_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { createdBy: req.userId };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tag: { $regex: search, $options: 'i' } }
      ];
    }
  
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }

    const [tickets, total] = await Promise.all([
      EventEntryTickets.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventEntryTickets.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, tickets, pagination, 'User event entry tickets retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update event entry ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventEntryTicket = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    req.body.updatedBy = req.userId;
    req.body.updatedAt = new Date();

    const ticket = await EventEntryTickets.findOneAndUpdate(
      { event_entry_tickets_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return sendNotFound(res, 'Event entry ticket not found');
    }

    sendSuccess(res, ticket, 'Event entry ticket updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete event entry ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEventEntryTicket = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await EventEntryTickets.findOneAndDelete({ event_entry_tickets_id: parseInt(id) });

    if (!ticket) {
      return sendNotFound(res, 'Event entry ticket not found');
    }

    sendSuccess(res, null, 'Event entry ticket deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createEventEntryTicket,
  getAllEventEntryTickets,
  getEventEntryTicketById,
  getEventEntryTicketsByAuth,
  updateEventEntryTicket,
  deleteEventEntryTicket
};

