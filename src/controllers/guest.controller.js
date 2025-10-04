const Guest = require('../models/guest.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new guest
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createGuest = asyncHandler(async (req, res) => {
  try {
    // Create guest data
    const guestData = {
      ...req.body,
      createdBy: req.userId
    };

    // Create guest
    const guest = await Guest.create(guestData);

    sendSuccess(res, guest, 'Guest created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all guests with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllGuests = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, event_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileno: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }
    if (event_id) {
      filter.event_id = event_id;
    }

    // Get guests with pagination
    const [guests, total] = await Promise.all([
      Guest.find(filter)
        .populate('event_id', 'event_id name_title date time')
        .populate('createdBy', 'user_id name email')
        .populate('updatedBy', 'user_id name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Guest.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, guests, pagination, 'Guests retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get guest by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGuestById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const guest = await Guest.findOne({ guest_id: parseInt(id) })
      .populate('event_id', 'event_id name_title date time')
      .populate('createdBy', 'user_id name email')
      .populate('updatedBy', 'user_id name email');

    if (!guest) {
      return sendNotFound(res, 'Guest not found');
    }

    sendSuccess(res, guest, 'Guest retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get guests by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGuestsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, event_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { createdBy: req.userId };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileno: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }
    if (event_id) {
      filter.event_id = event_id;
    }

    // Get guests with pagination
    const [guests, total] = await Promise.all([
      Guest.find(filter)
        .populate('event_id', 'event_id name_title date time')
        .populate('createdBy', 'user_id name email')
        .populate('updatedBy', 'user_id name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Guest.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, guests, pagination, 'User guests retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get guests by event ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGuestsByEventId = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { event_id: eventId };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileno: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Get guests with pagination
    const [guests, total] = await Promise.all([
      Guest.find(filter)
        .populate('event_id', 'event_id name_title date time')
        .populate('createdBy', 'user_id name email')
        .populate('updatedBy', 'user_id name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Guest.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, guests, pagination, 'Guests by event retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update guest
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateGuest = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    const guest = await Guest.findOneAndUpdate(
      { guest_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    ).populate('event_id', 'event_id name_title date time')
     .populate('createdBy', 'user_id name email')
     .populate('updatedBy', 'user_id name email');

    if (!guest) {
      return sendNotFound(res, 'Guest not found');
    }

    sendSuccess(res, guest, 'Guest updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete guest
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteGuest = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const guest = await Guest.findOneAndDelete({ guest_id: parseInt(id) });

    if (!guest) {
      return sendNotFound(res, 'Guest not found');
    }

    sendSuccess(res, null, 'Guest deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createGuest,
  getAllGuests,
  getGuestById,
  getGuestsByAuth,
  getGuestsByEventId,
  updateGuest,
  deleteGuest
};
