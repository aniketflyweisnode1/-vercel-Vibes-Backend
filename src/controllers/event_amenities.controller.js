const EventAmenities = require('../models/event_amenities.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new event amenity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEventAmenity = asyncHandler(async (req, res) => {
  try {
    const eventAmenityData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create event amenity
    const eventAmenity = await EventAmenities.create(eventAmenityData);
    sendSuccess(res, eventAmenity, 'Event amenity created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all event amenities with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEventAmenities = asyncHandler(async (req, res) => {
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
    const [eventAmenities, total] = await Promise.all([
      EventAmenities.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      EventAmenities.countDocuments(filter)
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
    sendPaginated(res, eventAmenities, pagination, 'Event amenities retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event amenity by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventAmenityById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const eventAmenity = await EventAmenities.findOne({event_amenities_id: parseInt(id)});

    if (!eventAmenity) {
      return sendNotFound(res, 'Event amenity not found');
    }
    sendSuccess(res, eventAmenity, 'Event amenity retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update event amenity by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventAmenity = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Validate ID
    if (!id) {
      return sendError(res, 'Valid event amenity ID is required', 400);
    }

    const eventAmenityId = id;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const eventAmenity = await EventAmenities.findOneAndUpdate(
      {event_amenities_id: eventAmenityId},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!eventAmenity) {
      return sendNotFound(res, 'Event amenity not found');
    }
    sendSuccess(res, eventAmenity, 'Event amenity updated successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createEventAmenity,
  getAllEventAmenities,
  getEventAmenityById,
  updateEventAmenity
};

