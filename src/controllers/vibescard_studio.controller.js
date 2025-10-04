const VibesCardStudio = require('../models/vibescard_studio.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new vibes card studio
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVibesCardStudio = asyncHandler(async (req, res) => {
  try {
    // Create vibes card studio data
    const vibesCardStudioData = {
      ...req.body,
      createdBy: req.userId
    };

    // Create vibes card studio
    const vibesCardStudio = await VibesCardStudio.create(vibesCardStudioData);

    sendSuccess(res, vibesCardStudio, 'Vibes card studio created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all vibes card studios with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVibesCardStudios = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, event_id, category_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { templates: { $regex: search, $options: 'i' } },
        { colorScheme: { $regex: search, $options: 'i' } },
        { canvas_size: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }
    if (event_id) {
      filter.event_id = event_id;
    }
    if (category_id) {
      filter.category_id = category_id;
    }

    // Get vibes card studios with pagination
    const [vibesCardStudios, total] = await Promise.all([
      VibesCardStudio.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VibesCardStudio.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, vibesCardStudios, pagination, 'Vibes card studios retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vibes card studio by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVibesCardStudioById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const vibesCardStudio = await VibesCardStudio.findOne({ vibescard_studio_id: parseInt(id) })
;

    if (!vibesCardStudio) {
      return sendNotFound(res, 'Vibes card studio not found');
    }

    sendSuccess(res, vibesCardStudio, 'Vibes card studio retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vibes card studios by event ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVibesCardStudiosByEventId = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10, search, status, category_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { event_id: eventId };
    if (search) {
      filter.$or = [
        { templates: { $regex: search, $options: 'i' } },
        { colorScheme: { $regex: search, $options: 'i' } },
        { canvas_size: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }
    if (category_id) {
      filter.category_id = category_id;
    }

    // Get vibes card studios with pagination
    const [vibesCardStudios, total] = await Promise.all([
      VibesCardStudio.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VibesCardStudio.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, vibesCardStudios, pagination, 'Vibes card studios by event retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vibes card studio
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVibesCardStudio = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    const vibesCardStudio = await VibesCardStudio.findOneAndUpdate(
      { vibescard_studio_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!vibesCardStudio) {
      return sendNotFound(res, 'Vibes card studio not found');
    }

    sendSuccess(res, vibesCardStudio, 'Vibes card studio updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete vibes card studio
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVibesCardStudio = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const vibesCardStudio = await VibesCardStudio.findOneAndDelete({ vibescard_studio_id: parseInt(id) });

    if (!vibesCardStudio) {
      return sendNotFound(res, 'Vibes card studio not found');
    }

    sendSuccess(res, null, 'Vibes card studio deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createVibesCardStudio,
  getAllVibesCardStudios,
  getVibesCardStudioById,
  getVibesCardStudiosByEventId,
  updateVibesCardStudio,
  deleteVibesCardStudio
};
