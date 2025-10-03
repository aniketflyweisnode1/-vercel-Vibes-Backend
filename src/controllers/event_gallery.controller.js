const EventGallery = require('../models/event_gallery.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new event gallery
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEventGallery = asyncHandler(async (req, res) => {
  try {
    const eventGalleryData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const eventGallery = await EventGallery.create(eventGalleryData);
    sendSuccess(res, eventGallery, 'Event Gallery created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all event galleries with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEventGallery = asyncHandler(async (req, res) => {
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
      filter.event_gallery_name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [eventGallery, total] = await Promise.all([
      EventGallery.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      EventGallery.countDocuments(filter)
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
    sendPaginated(res, eventGallery, pagination, 'Event Gallery retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event gallery by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventGalleryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const eventGallery = await EventGallery.findOne({ event_gallery_id: parseInt(id) });

    if (!eventGallery) {
      return sendNotFound(res, 'Event Gallery not found');
    }
    sendSuccess(res, eventGallery, 'Event Gallery retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update event gallery by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventGallery = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const eventGallery = await EventGallery.findOneAndUpdate(
      { event_gallery_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!eventGallery) {
      return sendNotFound(res, 'Event Gallery not found');
    }
    sendSuccess(res, eventGallery, 'Event Gallery updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete event gallery by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEventGallery = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const eventGallery = await EventGallery.findOneAndUpdate(
      { event_gallery_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!eventGallery) {
      return sendNotFound(res, 'Event Gallery not found');
    }
    sendSuccess(res, eventGallery, 'Event Gallery deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event gallery created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventGalleryByAuth = asyncHandler(async (req, res) => {
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
      filter.event_gallery_name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [eventGallery, total] = await Promise.all([
      EventGallery.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      EventGallery.countDocuments(filter)
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
    sendPaginated(res, eventGallery, pagination, 'User event gallery retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createEventGallery,
  getAllEventGallery,
  getEventGalleryById,
  updateEventGallery,
  deleteEventGallery,
  getEventGalleryByAuth
};

