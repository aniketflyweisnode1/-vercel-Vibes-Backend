const EventTasks = require('../models/event_tasks.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new event task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEventTask = asyncHandler(async (req, res) => {
  try {
    // Create event task data
    const eventTaskData = {
      ...req.body,
      createdBy: req.userId
    };

    // Create event task
    const eventTask = await EventTasks.create(eventTaskData);

    sendSuccess(res, eventTask, 'Event task created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all event tasks with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEventTasks = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { taskTitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Get event tasks with pagination
    const [eventTasks, total] = await Promise.all([
      EventTasks.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventTasks.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, eventTasks, pagination, 'Event tasks retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event task by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventTaskById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const eventTask = await EventTasks.findOne({ event_tasks_id: parseInt(id) });

    if (!eventTask) {
      return sendNotFound(res, 'Event task not found');
    }

    sendSuccess(res, eventTask, 'Event task retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event tasks by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventTasksByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { createdBy: req.userId };
    if (search) {
      filter.$or = [
        { taskTitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Get event tasks with pagination
    const [eventTasks, total] = await Promise.all([
      EventTasks.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventTasks.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, eventTasks, pagination, 'User event tasks retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update event task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    // Automatically set date fields when corresponding boolean fields are set to true
    if (req.body.confirmFinalGuestCount === true && !req.body.confirmFinalGuestCount_date) {
      req.body.confirmFinalGuestCount_date = new Date();
    } else if (req.body.confirmFinalGuestCount === false) {
      req.body.confirmFinalGuestCount_date = null;
    }

    if (req.body.finalizeMusicPlaylist === true && !req.body.finalizeMusicPlaylist_date) {
      req.body.finalizeMusicPlaylist_date = new Date();
    } else if (req.body.finalizeMusicPlaylist === false) {
      req.body.finalizeMusicPlaylist_date = null;
    }

    if (req.body.setupDecorations === true && !req.body.setupDecorations_date) {
      req.body.setupDecorations_date = new Date();
    } else if (req.body.setupDecorations === false) {
      req.body.setupDecorations_date = null;
    }

    const eventTask = await EventTasks.findOneAndUpdate(
      { event_tasks_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!eventTask) {
      return sendNotFound(res, 'Event task not found');
    }

    sendSuccess(res, eventTask, 'Event task updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete event task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEventTask = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const eventTask = await EventTasks.findOneAndDelete({ event_tasks_id: parseInt(id) });

    if (!eventTask) {
      return sendNotFound(res, 'Event task not found');
    }

    sendSuccess(res, null, 'Event task deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event tasks by event ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventTasksByEventId = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { event_id: parseInt(eventId) };
    if (search) {
      filter.$or = [
        { taskTitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Get event tasks with pagination
    const [eventTasks, total] = await Promise.all([
      EventTasks.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventTasks.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, eventTasks, pagination, 'Event tasks by event retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createEventTask,
  getAllEventTasks,
  getEventTaskById,
  getEventTasksByAuth,
  updateEventTask,
  deleteEventTask,
  getEventTasksByEventId
};
