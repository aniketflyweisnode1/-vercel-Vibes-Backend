const EventSetupRequirements = require('../models/event_setup_requirements.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new event setup requirement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEventSetupRequirement = asyncHandler(async (req, res) => {
  try {
    // Create event setup requirement data
    const eventSetupRequirementData = {
      ...req.body,
      createdBy: req.userId
    };

    // Create event setup requirement
    const eventSetupRequirement = await EventSetupRequirements.create(eventSetupRequirementData);

    sendSuccess(res, eventSetupRequirement, 'Event setup requirement created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all event setup requirements with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEventSetupRequirements = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
    }
  

    // Get event setup requirements with pagination
    const [eventSetupRequirements, total] = await Promise.all([
      EventSetupRequirements.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventSetupRequirements.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, eventSetupRequirements, pagination, 'Event setup requirements retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event setup requirement by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventSetupRequirementById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const eventSetupRequirement = await EventSetupRequirements.findOne({ setup_requirements_id: parseInt(id) });

    if (!eventSetupRequirement) {
      return sendNotFound(res, 'Event setup requirement not found');
    }

    sendSuccess(res, eventSetupRequirement, 'Event setup requirement retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event setup requirements by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventSetupRequirementsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { createdBy: req.userId };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
    }
  

    // Get event setup requirements with pagination
    const [eventSetupRequirements, total] = await Promise.all([
      EventSetupRequirements.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EventSetupRequirements.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, eventSetupRequirements, pagination, 'User event setup requirements retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update event setup requirement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventSetupRequirement = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    const eventSetupRequirement = await EventSetupRequirements.findOneAndUpdate(
      { setup_requirements_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!eventSetupRequirement) {
      return sendNotFound(res, 'Event setup requirement not found');
    }

    sendSuccess(res, eventSetupRequirement, 'Event setup requirement updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete event setup requirement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEventSetupRequirement = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const eventSetupRequirement = await EventSetupRequirements.findOneAndDelete({ setup_requirements_id: parseInt(id) });

    if (!eventSetupRequirement) {
      return sendNotFound(res, 'Event setup requirement not found');
    }

    sendSuccess(res, null, 'Event setup requirement deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createEventSetupRequirement,
  getAllEventSetupRequirements,
  getEventSetupRequirementById,
  getEventSetupRequirementsByAuth,
  updateEventSetupRequirement,
  deleteEventSetupRequirement
};
