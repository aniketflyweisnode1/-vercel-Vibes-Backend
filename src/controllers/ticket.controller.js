const validateTicketDetail = (detail, index) => {
  if (detail == null || typeof detail !== 'object') {
    throw new Error(`ticketDateils[${index}] must be an object`);
  }

  if (detail.ticket_type_id === undefined || detail.ticket_type_id === null) {
    throw new Error(`ticketDateils[${index}].ticket_type_id is required`);
  }
  if (detail.ticket_query === undefined || detail.ticket_query === null || detail.ticket_query === '') {
    throw new Error(`ticketDateils[${index}].ticket_query is required`);
  }
  if (detail.price === undefined || detail.price === null) {
    throw new Error(`ticketDateils[${index}].price is required`);
  }

  return {
    ticket_type_id: Number(detail.ticket_type_id),
    ticket_query: String(detail.ticket_query),
    price: Number(detail.price)
  };
};

const Ticket = require('../models/ticket.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new ticket
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTicket = asyncHandler(async (req, res) => {
  try {
    // Create ticket data
    const ticketData = {
      ...req.body,
      created_by: req.userId || null
    };

    if (!Array.isArray(ticketData.ticketDateils) || ticketData.ticketDateils.length === 0) {
      return sendError(res, 'ticketDateils must be a non-empty array', 400);
    }

    try {
      ticketData.ticketDateils = ticketData.ticketDateils.map((detail, index) => validateTicketDetail(detail, index));
    } catch (validationError) {
      return sendError(res, validationError.message, 400);
    }

    // Create ticket
    const ticket = await Ticket.create(ticketData);
    sendSuccess(res, ticket, 'Ticket created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all tickets with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllTickets = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      ticket_type_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { 'ticketDateils.ticket_query': { $regex: search, $options: 'i' } },
        { reply: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
  

    // Add ticket_type_id filter
    if (ticket_type_id && ticket_type_id !== '') {
      filter['ticketDateils.ticket_type_id'] = parseInt(ticket_type_id);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Ticket.countDocuments(filter)
    ]);

    // Calculate pagination info
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
    sendPaginated(res, tickets, pagination, 'Tickets retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get ticket by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTicketById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findOne({ 
      ticket_id: parseInt(id) 
    });

    if (!ticket) {
      return sendNotFound(res, 'Ticket not found');
    }
    sendSuccess(res, ticket, 'Ticket retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get tickets by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTicketByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;

    // Get tickets created by the authenticated user
    const tickets = await Ticket.find({ 
      created_by: userId 
    }).sort({ created_at: -1 });
    sendSuccess(res, tickets, 'Tickets retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get tickets by ticket type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTicketByTicketType = asyncHandler(async (req, res) => {
  try {
    const { ticketTypeId } = req.params;

    // Get tickets by ticket type
    const tickets = await Ticket.find({ 
      'ticketDateils.ticket_type_id': parseInt(ticketTypeId) 
    }).sort({ created_at: -1 });
    sendSuccess(res, tickets, 'Tickets retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update ticket by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTicket = asyncHandler(async (req, res) => {
  try {
    const { ticket_id, ticketDateils, ...updateFields } = req.body;

    const updateData = {
      ...updateFields,
      updated_by: req.userId,
      updated_at: new Date()
    };

    if (ticketDateils !== undefined) {
      if (!Array.isArray(ticketDateils) || ticketDateils.length === 0) {
        return sendError(res, 'ticketDateils must be a non-empty array', 400);
      }

      try {
        updateData.ticketDateils = ticketDateils.map((detail, index) => validateTicketDetail(detail, index));
      } catch (validationError) {
        return sendError(res, validationError.message, 400);
      }
    }

    const ticket = await Ticket.findOneAndUpdate(
      { ticket_id: parseInt(ticket_id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!ticket) {
      return sendNotFound(res, 'Ticket not found');
    }
    sendSuccess(res, ticket, 'Ticket updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete ticket by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteTicket = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findOneAndUpdate(
      { ticket_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!ticket) {
      return sendNotFound(res, 'Ticket not found');
    }
    sendSuccess(res, ticket, 'Ticket deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  getTicketByAuth,
  getTicketByTicketType,
  updateTicket,
  deleteTicket
};

