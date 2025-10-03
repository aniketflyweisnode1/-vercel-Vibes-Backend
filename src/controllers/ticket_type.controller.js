const TicketType = require('../models/ticket_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new ticket type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTicketType = asyncHandler(async (req, res) => {
  try {
    // Create ticket type data
    const ticketTypeData = {
      ...req.body,
      created_by: req.userId || null
    };

    // Create ticket type
    const ticketType = await TicketType.create(ticketTypeData);
    sendSuccess(res, ticketType, 'Ticket type created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all ticket types with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllTicketTypes = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { ticket_type: { $regex: search, $options: 'i' } },
        { emoji: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [ticketTypes, total] = await Promise.all([
      TicketType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      TicketType.countDocuments(filter)
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
    sendPaginated(res, ticketTypes, pagination, 'Ticket types retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get ticket type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTicketTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const ticketType = await TicketType.findOne({ 
      ticket_type_id: parseInt(id) 
    });

    if (!ticketType) {
      return sendNotFound(res, 'Ticket type not found');
    }
    sendSuccess(res, ticketType, 'Ticket type retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get ticket types by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTicketTypeByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;

    // Get ticket types created by the authenticated user
    const ticketTypes = await TicketType.find({ 
      created_by: userId 
    }).sort({ created_at: -1 });
    sendSuccess(res, ticketTypes, 'Ticket types retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update ticket type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTicketType = asyncHandler(async (req, res) => {
  try {
    const { ticket_type_id, ...updateFields } = req.body;

    // Add update metadata
    const updateData = {
      ...updateFields,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const ticketType = await TicketType.findOneAndUpdate(
      { ticket_type_id: parseInt(ticket_type_id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!ticketType) {
      return sendNotFound(res, 'Ticket type not found');
    }
    sendSuccess(res, ticketType, 'Ticket type updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete ticket type by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteTicketType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const ticketType = await TicketType.findOneAndUpdate(
      { ticket_type_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!ticketType) {
      return sendNotFound(res, 'Ticket type not found');
    }
    sendSuccess(res, ticketType, 'Ticket type deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createTicketType,
  getAllTicketTypes,
  getTicketTypeById,
  getTicketTypeByAuth,
  updateTicketType,
  deleteTicketType
};

