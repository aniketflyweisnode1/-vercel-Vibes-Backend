const State = require('../models/state.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new state
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createState = asyncHandler(async (req, res) => {
  try {
    // Create state data
    const stateData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create state
    const state = await State.create(stateData);

    // Note: Number references cannot be populated directly
    // You would need to manually fetch related data if needed
    sendSuccess(res, state, 'State created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all states with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllStates = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      country_id,
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

    // Add country_id filter
    if (country_id) {
      filter.country_id = country_id;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [states, total] = await Promise.all([
      State.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      State.countDocuments(filter)
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
    sendPaginated(res, states, pagination, 'States retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get state by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStateById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const state = await State.findOne({state_id: parseInt(id)});

    if (!state) {
      return sendNotFound(res, 'State not found');
    }
    sendSuccess(res, state, 'State retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update state by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateState = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params || req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const state = await State.findOneAndUpdate(
      {state_id: parseInt(id)},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!state) {
      return sendNotFound(res, 'State not found');
    }
    sendSuccess(res, state, 'State updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get states by country ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStatesByCountryId = asyncHandler(async (req, res) => {
  try {
    const { countryId } = req.params;

    const states = await State.find({ country_id: parseInt(countryId), status: true })
      .sort({ name: 1 });
    sendSuccess(res, states, 'States by country retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete state by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteState = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const state = await State.findOneAndDelete({ state_id: parseInt(id) });

    if (!state) {
      return sendNotFound(res, 'State not found');
    }

    sendSuccess(res, null, 'State deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createState,
  getAllStates,
  getStateById,
  updateState,
  getStatesByCountryId,
  deleteState
};

