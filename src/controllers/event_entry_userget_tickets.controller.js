const EventEntryUsergetTickets = require('../models/event_entry_userget_tickets.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new event entry userget ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEventEntryUsergetTicket = asyncHandler(async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      createdBy: req.userId
    };

    const ticket = await EventEntryUsergetTickets.create(ticketData);

    sendSuccess(res, ticket, 'Event entry userget ticket created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all event entry userget tickets with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEventEntryUsergetTickets = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, event_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }

    const [tickets, total] = await Promise.all([
      EventEntryUsergetTickets.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventEntryUsergetTickets.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, tickets, pagination, 'Event entry userget tickets retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event entry userget ticket by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventEntryUsergetTicketById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await EventEntryUsergetTickets.findOne({ event_entry_userget_tickets_id: parseInt(id) });

    if (!ticket) {
      return sendNotFound(res, 'Event entry userget ticket not found');
    }

    sendSuccess(res, ticket, 'Event entry userget ticket retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event entry userget tickets by event ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventEntryUsergetTicketsByEventId = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { event_id: parseInt(eventId) };

    const [tickets, total] = await Promise.all([
      EventEntryUsergetTickets.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventEntryUsergetTickets.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, tickets, pagination, 'Event entry userget tickets by event retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update event entry userget ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventEntryUsergetTicket = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    req.body.updatedBy = req.userId;
    req.body.updatedAt = new Date();

    const ticket = await EventEntryUsergetTickets.findOneAndUpdate(
      { event_entry_userget_tickets_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return sendNotFound(res, 'Event entry userget ticket not found');
    }

    sendSuccess(res, ticket, 'Event entry userget ticket updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete event entry userget ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEventEntryUsergetTicket = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await EventEntryUsergetTickets.findOneAndDelete({ event_entry_userget_tickets_id: parseInt(id) });

    if (!ticket) {
      return sendNotFound(res, 'Event entry userget ticket not found');
    }

    sendSuccess(res, null, 'Event entry userget ticket deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createEventEntryUsergetTicket,
  getAllEventEntryUsergetTickets,
  getEventEntryUsergetTicketById,
  getEventEntryUsergetTicketsByEventId,
  updateEventEntryUsergetTicket,
  deleteEventEntryUsergetTicket
};

