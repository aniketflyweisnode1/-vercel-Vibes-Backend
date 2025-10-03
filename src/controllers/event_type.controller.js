const EventType = require('../models/event_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

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
    sendSuccess(res, eventType, 'Event type created successfully', 201);
  } catch (error) {
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
    sendPaginated(res, eventTypes, pagination, 'Event types retrieved successfully');
  } catch (error) {
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
    sendSuccess(res, eventType, 'Event type retrieved successfully');
  } catch (error) {
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
    sendSuccess(res, eventType, 'Event type updated successfully');
  } catch (error) {
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
    sendSuccess(res, eventType, 'Event type deleted successfully');
  } catch (error) {
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
    sendPaginated(res, eventTypes, pagination, 'User event types retrieved successfully');
  } catch (error) {
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
    sendSuccess(res, eventType, 'Event type updated successfully');
  } catch (error) {
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

