const EventCategoryTags = require('../models/event_category_tags.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new event category tags
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEventCategoryTags = asyncHandler(async (req, res) => {
  try {
    // Create event category tags data
    const eventCategoryTagsData = {
      ...req.body,
      created_by: req.userId
    };

    // Create event category tags
    const eventCategoryTags = await EventCategoryTags.create(eventCategoryTagsData);

    // Note: Number references cannot be populated directly
    sendSuccess(res, eventCategoryTags, 'Event category tags created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all event category tags with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEventCategoryTags = asyncHandler(async (req, res) => {
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
        { name: { $regex: search, $options: 'i' } }
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
    const [eventCategoryTags, total] = await Promise.all([
      EventCategoryTags.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      EventCategoryTags.countDocuments(filter)
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
    sendPaginated(res, eventCategoryTags, pagination, 'Event category tags retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event category tags by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventCategoryTagsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const eventCategoryTags = await EventCategoryTags.findOne({event_category_tags_id: parseInt(id)});

    if (!eventCategoryTags) {
      return sendNotFound(res, 'Event category tags not found');
    }
    sendSuccess(res, eventCategoryTags, 'Event category tags retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update event category tags by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventCategoryTags = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params || req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const eventCategoryTags = await EventCategoryTags.findOneAndUpdate(
      {event_category_tags_id: parseInt(id)},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!eventCategoryTags) {
      return sendNotFound(res, 'Event category tags not found');
    }
    sendSuccess(res, eventCategoryTags, 'Event category tags updated successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createEventCategoryTags,
  getAllEventCategoryTags,
  getEventCategoryTagsById,
  updateEventCategoryTags
};

