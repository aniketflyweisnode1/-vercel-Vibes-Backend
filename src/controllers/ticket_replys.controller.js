const TicketReplys = require('../models/ticket_replys.model');
const Ticket = require('../models/ticket.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new ticket reply
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTicketReply = asyncHandler(async (req, res) => {
  try {
    // Create ticket reply data
    const ticketReplyData = {
      ...req.body,
      reply_by_id: req.userId || null,
      created_by: req.userId || null
    };

    // Create ticket reply
    const ticketReply = await TicketReplys.create(ticketReplyData);

    // Update the ticket's reply field with the latest reply
    await updateTicketReplyField(ticketReply.ticket_id, ticketReply.reply);

    logger.info('Ticket reply created successfully', { 
      ticketReplyId: ticketReply._id, 
      ticket_replys_id: ticketReply.ticket_replys_id 
    });

    sendSuccess(res, ticketReply, 'Ticket reply created successfully', 201);
  } catch (error) {
    logger.error('Error creating ticket reply', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Update ticket reply field in ticket model
 * @param {Number} ticketId - Ticket ID
 * @param {String} reply - Reply text
 */
const updateTicketReplyField = async (ticketId, reply) => {
  try {
    await Ticket.findOneAndUpdate(
      { ticket_id: ticketId },
      { 
        reply: reply,
        updated_at: new Date()
      }
    );
    
    logger.info('Ticket reply field updated', { ticketId, reply });
  } catch (error) {
    logger.error('Error updating ticket reply field', { 
      error: error.message, 
      ticketId 
    });
    throw error;
  }
};

/**
 * Update all ticket replies and update ticket reply field
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAllTicketReplies = asyncHandler(async (req, res) => {
  try {
    const { ticket_id } = req.body;

    // Get all replies for the ticket
    const replies = await TicketReplys.find({ 
      ticket_id: parseInt(ticket_id),
      status: true 
    }).sort({ created_at: -1 });

    if (replies.length === 0) {
      return sendError(res, 'No replies found for this ticket', 404);
    }

    // Get the latest reply
    const latestReply = replies[0];

    // Update the ticket's reply field with the latest reply
    await updateTicketReplyField(ticket_id, latestReply.reply);

    logger.info('All ticket replies updated successfully', { 
      ticketId: ticket_id,
      replyCount: replies.length
    });

    sendSuccess(res, {
      message: 'All ticket replies updated successfully',
      latestReply: latestReply.reply,
      totalReplies: replies.length
    }, 'All ticket replies updated successfully');
  } catch (error) {
    logger.error('Error updating all ticket replies', { 
      error: error.message, 
      ticketId: req.body.ticket_id 
    });
    throw error;
  }
});

/**
 * Get all ticket replies with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllTicketReplies = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      ticket_id,
      reply_by_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { reply: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = 'true';
    }

    // Add ticket_id filter
    if (ticket_id && ticket_id !== '') {
      filter.ticket_id = parseInt(ticket_id);
    }

    // Add reply_by_id filter
    if (reply_by_id && reply_by_id !== '') {
      filter.reply_by_id = parseInt(reply_by_id);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [ticketReplies, total] = await Promise.all([
      TicketReplys.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      TicketReplys.countDocuments(filter)
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

    logger.info('Ticket replies retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, ticketReplies, pagination, 'Ticket replies retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving ticket replies', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get ticket reply by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTicketReplyById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const ticketReply = await TicketReplys.findOne({ 
      ticket_replys_id: parseInt(id) 
    });

    if (!ticketReply) {
      return sendNotFound(res, 'Ticket reply not found');
    }

    logger.info('Ticket reply retrieved successfully', { 
      ticketReplyId: ticketReply._id 
    });

    sendSuccess(res, ticketReply, 'Ticket reply retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving ticket reply', { 
      error: error.message, 
      ticketReplyId: req.params.id 
    });
    throw error;
  }
});

/**
 * Get ticket replies by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTicketReplyByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;

    // Get ticket replies created by the authenticated user
    const ticketReplies = await TicketReplys.find({ 
      reply_by_id: userId 
    }).sort({ created_at: -1 });

    logger.info('Ticket replies retrieved successfully for user', { 
      userId, 
      count: ticketReplies.length 
    });

    sendSuccess(res, ticketReplies, 'Ticket replies retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving ticket replies by auth', { 
      error: error.message, 
      userId: req.userId 
    });
    throw error;
  }
});

/**
 * Update ticket reply by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateTicketReply = asyncHandler(async (req, res) => {
  try {
    const { ticket_replys_id, ...updateFields } = req.body;

    // Get the original ticket reply to get ticket_id
    const originalReply = await TicketReplys.findOne({ 
      ticket_replys_id: parseInt(ticket_replys_id) 
    });

    if (!originalReply) {
      return sendNotFound(res, 'Ticket reply not found');
    }

    // Add update metadata
    const updateData = {
      ...updateFields,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const ticketReply = await TicketReplys.findOneAndUpdate(
      { ticket_replys_id: parseInt(ticket_replys_id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    // If reply text was updated, update the ticket's reply field
    if (req.body.reply && req.body.reply !== originalReply.reply) {
      await updateTicketReplyField(ticketReply.ticket_id, ticketReply.reply);
    }

    logger.info('Ticket reply updated successfully', { 
      ticketReplyId: ticketReply._id 
    });

    sendSuccess(res, ticketReply, 'Ticket reply updated successfully');
  } catch (error) {
    logger.error('Error updating ticket reply', { 
      error: error.message, 
      ticketReplyId: req.params.id 
    });
    throw error;
  }
});

/**
 * Delete ticket reply by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteTicketReply = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const ticketReply = await TicketReplys.findOneAndUpdate(
      { ticket_replys_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!ticketReply) {
      return sendNotFound(res, 'Ticket reply not found');
    }

    // Update the ticket's reply field with the latest active reply
    const latestReply = await TicketReplys.findOne({ 
      ticket_id: ticketReply.ticket_id,
      status: true 
    }).sort({ created_at: -1 });

    if (latestReply) {
      await updateTicketReplyField(ticketReply.ticket_id, latestReply.reply);
    } else {
      // If no active replies, clear the ticket's reply field
      await updateTicketReplyField(ticketReply.ticket_id, '');
    }

    logger.info('Ticket reply deleted successfully', { 
      ticketReplyId: ticketReply._id 
    });

    sendSuccess(res, ticketReply, 'Ticket reply deleted successfully');
  } catch (error) {
    logger.error('Error deleting ticket reply', { 
      error: error.message, 
      ticketReplyId: req.params.id 
    });
    throw error;
  }
});

module.exports = {
  createTicketReply,
  updateAllTicketReplies,
  getAllTicketReplies,
  getTicketReplyById,
  getTicketReplyByAuth,
  updateTicketReply,
  deleteTicketReply
};
