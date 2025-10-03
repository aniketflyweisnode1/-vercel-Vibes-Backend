const EventTheme = require('../models/event_theme.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new event theme
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEventTheme = asyncHandler(async (req, res) => {
  try {
    const eventThemeData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const eventTheme = await EventTheme.create(eventThemeData);
    sendSuccess(res, eventTheme, 'Event Theme created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all event themes with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEventTheme = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.event_theme_name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [eventTheme, total] = await Promise.all([
      EventTheme.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      EventTheme.countDocuments(filter)
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
    sendPaginated(res, eventTheme, pagination, 'Event Theme retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event theme by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventThemeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const eventTheme = await EventTheme.findOne({ event_theme_id: parseInt(id) });

    if (!eventTheme) {
      return sendNotFound(res, 'Event Theme not found');
    }
    sendSuccess(res, eventTheme, 'Event Theme retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update event theme by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventTheme = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const eventTheme = await EventTheme.findOneAndUpdate(
      { event_theme_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!eventTheme) {
      return sendNotFound(res, 'Event Theme not found');
    }
    sendSuccess(res, eventTheme, 'Event Theme updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete event theme by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEventTheme = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const eventTheme = await EventTheme.findOneAndUpdate(
      { event_theme_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!eventTheme) {
      return sendNotFound(res, 'Event Theme not found');
    }
    sendSuccess(res, eventTheme, 'Event Theme deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event theme created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventThemeByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {
      created_by: req.userId
    };

    if (search) {
      filter.event_theme_name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [eventTheme, total] = await Promise.all([
      EventTheme.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      EventTheme.countDocuments(filter)
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
    sendPaginated(res, eventTheme, pagination, 'User event theme retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createEventTheme,
  getAllEventTheme,
  getEventThemeById,
  updateEventTheme,
  deleteEventTheme,
  getEventThemeByAuth
};

