const EventDiscussionChat = require('../models/event_discussion_chat.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new event discussion chat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEventDiscussionChat = asyncHandler(async (req, res) => {
  try {
    // Create event discussion chat data
    const eventDiscussionChatData = {
      ...req.body,
      user_id: req.userId,
      createdBy: req.userId
    };

    const eventDiscussionChat = await EventDiscussionChat.create(eventDiscussionChatData);

    sendSuccess(res, eventDiscussionChat, 'Event discussion chat created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all event discussion chats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEventDiscussionChats = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, event_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }

    // Get event discussion chats with pagination
    const [eventDiscussionChats, total] = await Promise.all([
      EventDiscussionChat.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventDiscussionChat.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, 'Event discussion chats retrieved successfully', eventDiscussionChats, pagination);
  } catch (error) {
    throw error;
  }
});

/**
 * Get event discussion chats by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventDiscussionChatsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, event_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { createdBy: req.userId };
    if (search) {
      filter.$or = [
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }

    // Get event discussion chats with pagination
    const [eventDiscussionChats, total] = await Promise.all([
      EventDiscussionChat.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventDiscussionChat.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, 'Event discussion chats retrieved successfully', eventDiscussionChats, pagination);
  } catch (error) {
    throw error;
  }
});

/**
 * Get event discussion chat by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventDiscussionChatById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const eventDiscussionChat = await EventDiscussionChat.findOne({ id: parseInt(id) });

    if (!eventDiscussionChat) {
      return sendNotFound(res, 'Event discussion chat not found');
    }

    sendSuccess(res, 'Event discussion chat retrieved successfully', eventDiscussionChat);
  } catch (error) {
    throw error;
  }
});

/**
 * Update event discussion chat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventDiscussionChat = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    const eventDiscussionChat = await EventDiscussionChat.findOneAndUpdate(
      { id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!eventDiscussionChat) {
      return sendNotFound(res, 'Event discussion chat not found');
    }

    sendSuccess(res, 'Event discussion chat updated successfully', eventDiscussionChat);
  } catch (error) {
    throw error;
  }
});

/**
 * Delete event discussion chat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEventDiscussionChat = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const eventDiscussionChat = await EventDiscussionChat.findOneAndDelete({ id: parseInt(id) });

    if (!eventDiscussionChat) {
      return sendNotFound(res, 'Event discussion chat not found');
    }

    sendSuccess(res, 'Event discussion chat deleted successfully', null);
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createEventDiscussionChat,
  getAllEventDiscussionChats,
  getEventDiscussionChatById,
  getEventDiscussionChatsByAuth,
  updateEventDiscussionChat,
  deleteEventDiscussionChat
};
