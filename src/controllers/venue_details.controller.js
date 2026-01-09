const VenueDetails = require('../models/venue_details.model');
const Event = require('../models/event.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new venue details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVenueDetails = asyncHandler(async (req, res) => {
  try {
    // Create venue details data
    const venueDetailsData = {
      ...req.body,
      createdBy: req.userId,
      roleId: req.roleId
    };

    // Create venue details
    const venueDetails = await VenueDetails.create(venueDetailsData);

    sendSuccess(res, venueDetails, 'Venue details created successfully', 201);
  } catch (error) {
    throw error;
  }
});
/**
 * Get all venue details with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVenueDetails = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) {
      filter.type = { $regex: type, $options: 'i' };
    }

    // Get venue details with pagination
    const [venueDetails, total] = await Promise.all([
      VenueDetails.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VenueDetails.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, venueDetails, pagination, 'Venue details retrieved successfully');
  } catch (error) {
    throw error;
  }
});
const getAllVenueDetailsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { createdBy: req.userId, };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) {
      filter.type = { $regex: type, $options: 'i' };
    }

    // Get venue details with pagination
    const [venueDetails, total] = await Promise.all([
      VenueDetails.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VenueDetails.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, venueDetails, pagination, 'Venue details retrieved successfully');
  } catch (error) {
    throw error;
  }
});
const getAllVendorVenueDetails = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, type, price } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { roleId: 3 };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) {
      filter.type = { $regex: type, $options: 'i' };
    }
    if (price) {
      filter.price = { $lte: price };
    }
    // Get venue details with pagination
    const [venueDetails, total] = await Promise.all([
      VenueDetails.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VenueDetails.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, venueDetails, pagination, 'Venue details retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get venue details by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVenueDetailsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const venueDetails = await VenueDetails.findOne({ venue_details_id: parseInt(id) });

    if (!venueDetails) {
      return sendNotFound(res, 'Venue details not found');
    }

    sendSuccess(res, venueDetails, 'Venue details retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update venue details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVenueDetails = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    const venueDetails = await VenueDetails.findOneAndUpdate(
      { venue_details_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!venueDetails) {
      return sendNotFound(res, 'Venue details not found');
    }

    sendSuccess(res, venueDetails, 'Venue details updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete venue details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVenueDetails = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const venueDetails = await VenueDetails.findOneAndDelete({ venue_details_id: parseInt(id) });

    if (!venueDetails) {
      return sendNotFound(res, 'Venue details not found');
    }

    sendSuccess(res, null, 'Venue details deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get venue details by event ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVenueDetailsByEventId = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find the event by event_id
    const event = await Event.findOne({ event_id: parseInt(eventId) });

    if (!event) {
      return sendNotFound(res, 'Event not found');
    }

    // Check if event has venue_details_id
    if (!event.venue_details_id) {
      return sendNotFound(res, 'No venue details associated with this event');
    }

    // Find the venue details by venue_details_id
    const venueDetails = await VenueDetails.findOne({ venue_details_id: parseInt(event.venue_details_id) });

    if (!venueDetails) {
      return sendNotFound(res, 'Venue details not found');
    }

    sendSuccess(res, venueDetails, 'Venue details retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createVenueDetails,
  getAllVenueDetails,
  getVenueDetailsById,
  updateVenueDetails,
  deleteVenueDetails,
  getVenueDetailsByEventId,
  getAllVenueDetailsByAuth,
  getAllVendorVenueDetails
};
