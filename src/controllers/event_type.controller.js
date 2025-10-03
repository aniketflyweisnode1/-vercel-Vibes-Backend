const EventType = require('../models/event_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new event type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEventType = asyncHandler(async (req, res) => {
  try {
    // Get next event_type_id

    // Create event type data
    const eventTypeData = {
      ...req.body,
      created_by: req.userId
    };

    // Create event type
    const eventType = await EventType.create(eventTypeData);

    // Note: Number references cannot be populated directly

    logger.info('Event type created successfully', { eventTypeId: eventType._id, event_type_id: eventType.event_type_id });

    sendSuccess(res, eventType, 'Event type created successfully', 201);
  } catch (error) {
    logger.error('Error creating event type', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all event types with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEventTypes = asyncHandler(async (req, res) => {
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
        { name: { $regex: search, $options: 'i' } },
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
    const [eventTypes, total] = await Promise.all([
      EventType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      EventType.countDocuments(filter)
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

    logger.info('Event types retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, eventTypes, pagination, 'Event types retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving event types', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get event type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const eventType = await EventType.findOne({event_type_id: parseInt(id)});

    if (!eventType) {
      return sendNotFound(res, 'Event type not found');
    }

    logger.info('Event type retrieved successfully', { eventTypeId: eventType._id });

    sendSuccess(res, eventType, 'Event type retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving event type', { error: error.message, eventTypeId: req.params.id });
    throw error;
  }
});

/**
 * Update event type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params || req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const eventType = await EventType.findOneAndUpdate(
      {event_type_id: parseInt(id)},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    )
    .populate('created_by', 'name email')
    .populate('updated_by', 'name email');

    if (!eventType) {
      return sendNotFound(res, 'Event type not found');
    }

    logger.info('Event type updated successfully', { eventTypeId: eventType._id });

    sendSuccess(res, eventType, 'Event type updated successfully');
  } catch (error) {
    logger.error('Error updating event type', { error: error.message, eventTypeId: req.params.id });
    throw error;
  }
});

/**
 * Delete event type by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEventType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const eventType = await EventType.findOneAndUpdate(
      {event_type_id: parseInt(id)},
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    )
    .populate('created_by', 'name email')
    .populate('updated_by', 'name email');

    if (!eventType) {
      return sendNotFound(res, 'Event type not found');
    }

    logger.info('Event type deleted successfully', { eventTypeId: eventType._id });

    sendSuccess(res, eventType, 'Event type deleted successfully');
  } catch (error) {
    logger.error('Error deleting event type', { error: error.message, eventTypeId: req.params.id });
    throw error;
  }
});

/**
 * Get event types created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventTypesByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object - only show event types created by the authenticated user
    const filter = {
      created_by: req.userId
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
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
    const [eventTypes, total] = await Promise.all([
      EventType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))

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

    logger.info('User event types retrieved successfully', { 
      userId: req.userId,
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, eventTypes, pagination, 'User event types retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving user event types', { error: error.message, userId: req.userId });
    throw error;
  }
});

/**
 * Update event type by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventTypeByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const eventType = await EventType.findOneAndUpdate(
      {event_type_id: parseInt(id)},
      finalUpdateData,
      { 
        new: true, 
        runValidators: true
      }
    )
    .populate('created_by', 'name email')
    .populate('updated_by', 'name email');

    if (!eventType) {
      return sendNotFound(res, 'Event type not found');
    }

    logger.info('Event type updated successfully by ID in body', { eventTypeId: eventType._id, updatedBy: req.userId });

    sendSuccess(res, eventType, 'Event type updated successfully');
  } catch (error) {
    logger.error('Error updating event type by ID in body', { error: error.message, eventTypeId: req.body.id });
    throw error;
  }
});

module.exports = {
  createEventType,
  getAllEventTypes,
  getEventTypeById,
  updateEventType,
  updateEventTypeByIdBody,
  deleteEventType,
  getEventTypesByAuth
};
