const Messages = require('../models/messages.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

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
    sendSuccess(res, message, 'Message created successfully', 201);
  } catch (error) {
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
    sendPaginated(res, messages, pagination, 'Messages retrieved successfully');
  } catch (error) {
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
    sendSuccess(res, message, 'Message retrieved successfully');
  } catch (error) {
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
    sendSuccess(res, messages, 'Messages retrieved successfully');
  } catch (error) {
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
    sendSuccess(res, message, 'Message updated successfully');
  } catch (error) {
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
    sendSuccess(res, message, 'Message deleted successfully');
  } catch (error) {
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

