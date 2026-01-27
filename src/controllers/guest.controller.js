const Guest = require('../models/guest.model');
const Event = require('../models/event.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const emailService = require('../../utils/emailService');
/**
 * Create a new guest
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createGuest1 = asyncHandler(async (req, res) => {
  try {
    const guestData = {
      ...req.body,
      createdBy: req.userId
    };
    const guest = await Guest.create(guestData);
    sendSuccess(res, guest, 'Guest created successfully', 201);
  } catch (error) {
    throw error;
  }
});
const createGuest = asyncHandler(async (req, res) => {
  try {
    const guestData = {
      ...req.body,
      createdBy: req.userId
    };
    const guest = await Guest.create(guestData);
    if (guest) {
      const event = await Event.findOne({ event_id: guest.event_id });
      if (guest.email && event) {
        const emailEventData = {
          title: event.name_title,
          date: event.date,
          time: event.time,
          location: event.street_address
        };
        await emailService.sendGuestInvitationEmail(guest.email, guest, emailEventData);
      }
      sendSuccess(res, guest, 'Guest created successfully', 201);
    }
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
    const { page = 1, limit = 10, search, status, event_id, role_id } = req.query;
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

    if (event_id) {
      filter.event_id = parseInt(event_id);
    }
    if (role_id) {
      filter.role_id = parseInt(role_id);
    }

    // Get guests with pagination
    const [guests, total] = await Promise.all([
      Guest.find(filter)
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

    const guest = await Guest.findOne({ guest_id: parseInt(id) });

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
    const { page = 1, limit = 10, search, status, event_id, role_id } = req.query;
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

    if (event_id) {
      filter.event_id = parseInt(event_id);
    }
    if (role_id) {
      filter.role_id = parseInt(role_id);
    }

    // Get guests with pagination
    const [guests, total] = await Promise.all([
      Guest.find(filter)
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
    const { page = 1, limit = 10, search, status, role_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { event_id: parseInt(eventId) };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileno: { $regex: search, $options: 'i' } }
      ];
    }

    if (role_id) {
      filter.role_id = parseInt(role_id);
    }

    // Get guests with pagination
    const [guests, total] = await Promise.all([
      Guest.find(filter)
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
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    const guest = await Guest.findOneAndUpdate(
      { guest_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

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
const getGuestCountsByEventId = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    const result = await Guest.aggregate([
      {
        $match: {
          event_id: parseInt(eventId),
          status: true
        }
      },
      {
        $group: {
          _id: "$role_id",     // 👈 role name directly
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          totalGuests: { $sum: "$count" },
          roles: {
            $push: {
              name: "$_id",
              count: "$count"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalGuests: 1,
          roles: 1
        }
      }
    ]);

    return res.status(200).json({
      status: 200,
      message: "Guest counts fetched successfully",
      data: result[0] || { totalGuests: 0, roles: [] }
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Failed to fetch guest counts",
      error: error.message
    });
  }
});

module.exports = {
  createGuest,
  getAllGuests,
  getGuestById,
  getGuestsByAuth,
  getGuestsByEventId,
  updateGuest,
  deleteGuest,
  getGuestCountsByEventId
};
