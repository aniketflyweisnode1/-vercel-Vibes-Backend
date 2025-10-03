const Messages = require('../models/messages.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createMessage = asyncHandler(async (req, res) => {
  try {
    // Create message data
    const messageData = {
      ...req.body,
      created_by: req.userId || null
    };

    // Create message
    const message = await Messages.create(messageData);

    logger.info('Message created successfully', { 
      messageId: message._id, 
      messages_id: message.messages_id 
    });

    sendSuccess(res, message, 'Message created successfully', 201);
  } catch (error) {
    logger.error('Error creating message', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all messages with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllMessages = asyncHandler(async (req, res) => {
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
        { messages_txt: { $regex: search, $options: 'i' } },
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
    const [messages, total] = await Promise.all([
      Messages.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Messages.countDocuments(filter)
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

    logger.info('Messages retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, messages, pagination, 'Messages retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving messages', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get message by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMessageById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Messages.findOne({ 
      messages_id: parseInt(id) 
    });

    if (!message) {
      return sendNotFound(res, 'Message not found');
    }

    logger.info('Message retrieved successfully', { 
      messageId: message._id 
    });

    sendSuccess(res, message, 'Message retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving message', { 
      error: error.message, 
      messageId: req.params.id 
    });
    throw error;
  }
});

/**
 * Get messages by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMessageByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;

    // Get messages created by the authenticated user
    const messages = await Messages.find({ 
      created_by: userId 
    }).sort({ created_at: -1 });

    logger.info('Messages retrieved successfully for user', { 
      userId, 
      count: messages.length 
    });

    sendSuccess(res, messages, 'Messages retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving messages by auth', { 
      error: error.message, 
      userId: req.userId 
    });
    throw error;
  }
});

/**
 * Update message by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateMessage = asyncHandler(async (req, res) => {
  try {
    const { messages_id, ...updateFields } = req.body;

    // Add update metadata
    const updateData = {
      ...updateFields,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const message = await Messages.findOneAndUpdate(
      { messages_id: parseInt(messages_id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!message) {
      return sendNotFound(res, 'Message not found');
    }

    logger.info('Message updated successfully', { 
      messageId: message._id 
    });

    sendSuccess(res, message, 'Message updated successfully');
  } catch (error) {
    logger.error('Error updating message', { 
      error: error.message, 
      messageId: req.params.id 
    });
    throw error;
  }
});

/**
 * Delete message by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteMessage = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Messages.findOneAndUpdate(
      { messages_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!message) {
      return sendNotFound(res, 'Message not found');
    }

    logger.info('Message deleted successfully', { 
      messageId: message._id 
    });

    sendSuccess(res, message, 'Message deleted successfully');
  } catch (error) {
    logger.error('Error deleting message', { 
      error: error.message, 
      messageId: req.params.id 
    });
    throw error;
  }
});

module.exports = {
  createMessage,
  getAllMessages,
  getMessageById,
  getMessageByAuth,
  updateMessage,
  deleteMessage
};
