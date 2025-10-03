const ShareEvent = require('../models/share_event.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new share event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createShareEvent = asyncHandler(async (req, res) => {
  try {
    const shareEventData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const shareEvent = await ShareEvent.create(shareEventData);

    logger.info('Share Event created successfully', { shareEventId: shareEvent._id, share_event_id: shareEvent.share_event_id });

    sendSuccess(res, shareEvent, 'Share Event created successfully', 201);
  } catch (error) {
    logger.error('Error creating share event', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all share events with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllShareEvent = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      event_id,
      share_user_to,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (event_id) {
      filter.event_id = parseInt(event_id);
    }

    if (share_user_to) {
      filter.share_user_to = parseInt(share_user_to);
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [shareEvent, total] = await Promise.all([
      ShareEvent.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      ShareEvent.countDocuments(filter)
    ]);

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

    logger.info('Share Event retrieved successfully', { total, page: parseInt(page), limit: parseInt(limit) });

    sendPaginated(res, shareEvent, pagination, 'Share Event retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving share event', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get share event by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getShareEventById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const shareEvent = await ShareEvent.findOne({ share_event_id: parseInt(id) });

    if (!shareEvent) {
      return sendNotFound(res, 'Share Event not found');
    }

    logger.info('Share Event retrieved successfully', { shareEventId: shareEvent._id });

    sendSuccess(res, shareEvent, 'Share Event retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving share event', { error: error.message, shareEventId: req.params.id });
    throw error;
  }
});

/**
 * Update share event by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateShareEvent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const shareEvent = await ShareEvent.findOneAndUpdate(
      { share_event_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!shareEvent) {
      return sendNotFound(res, 'Share Event not found');
    }

    logger.info('Share Event updated successfully', { shareEventId: shareEvent._id });

    sendSuccess(res, shareEvent, 'Share Event updated successfully');
  } catch (error) {
    logger.error('Error updating share event', { error: error.message });
    throw error;
  }
});

/**
 * Delete share event by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteShareEvent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const shareEvent = await ShareEvent.findOneAndUpdate(
      { share_event_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!shareEvent) {
      return sendNotFound(res, 'Share Event not found');
    }

    logger.info('Share Event deleted successfully', { shareEventId: shareEvent._id });

    sendSuccess(res, shareEvent, 'Share Event deleted successfully');
  } catch (error) {
    logger.error('Error deleting share event', { error: error.message, shareEventId: req.params.id });
    throw error;
  }
});

/**
 * Get share event created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getShareEventByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      event_id,
      share_user_to,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {
      created_by: req.userId
    };

    if (event_id) {
      filter.event_id = parseInt(event_id);
    }

    if (share_user_to) {
      filter.share_user_to = parseInt(share_user_to);
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [shareEvent, total] = await Promise.all([
      ShareEvent.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      ShareEvent.countDocuments(filter)
    ]);

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

    logger.info('User share event retrieved successfully', { userId: req.userId, total, page: parseInt(page), limit: parseInt(limit) });

    sendPaginated(res, shareEvent, pagination, 'User share event retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving user share event', { error: error.message, userId: req.userId });
    throw error;
  }
});

module.exports = {
  createShareEvent,
  getAllShareEvent,
  getShareEventById,
  updateShareEvent,
  deleteShareEvent,
  getShareEventByAuth
};

