const Status = require('../models/status.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createStatus = asyncHandler(async (req, res) => {
  try {
    const statusData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create status
    const status = await Status.create(statusData);
    sendSuccess(res, status, 'Status created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all statuses with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllStatuses = asyncHandler(async (req, res) => {
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
        { color: { $regex: search, $options: 'i' } },
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
    const [statuses, total] = await Promise.all([
      Status.find()
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Status.countDocuments(filter)
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
    sendPaginated(res, statuses, pagination, 'Statuses retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get status by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStatusById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const status = await Status.findOne({status_id: parseInt(id)});

    if (!status) {
      return sendNotFound(res, 'Status not found');
    }
    sendSuccess(res, status, 'Status retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update status by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateStatus = asyncHandler(async (req, res) => {
  try {
    const { id } =  req.body;

    // Validate ID
    if (!id) {
      return sendError(res, 'Valid status ID is required', 400);
    }

    const statusId = id;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const status = await Status.findOneAndUpdate(
      {status_id: statusId},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!status) {
      return sendNotFound(res, 'Status not found');
    }
    sendSuccess(res, status, 'Status updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update all statuses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAllStatuses = asyncHandler(async (req, res) => {
  try {
    const { statuses } = req.body; // Array of status objects with id and update data

    if (!Array.isArray(statuses)) {
      return sendError(res, 'Statuses must be an array', 400);
    }

    const updatePromises = statuses.map(async (statusData) => {
      const { id, ...updateData } = statusData;
      
      // Validate ID
      if (!id || isNaN(parseInt(id))) {
        throw new Error(`Invalid status ID: ${id}`);
      }

      const statusId = parseInt(id);
      
      return Status.findOneAndUpdate(
        { status_id: statusId },
        {
          ...updateData,
          updated_by: req.userId,
          updated_at: new Date()
        },
        { 
          new: true, 
          runValidators: true
        }
      );
    });

    const updatedStatuses = await Promise.all(updatePromises);
    sendSuccess(res, updatedStatuses, 'All statuses updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete status by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const status = await Status.findOneAndDelete({ status_id: parseInt(id) });

    if (!status) {
      return sendNotFound(res, 'Status not found');
    }

    sendSuccess(res, null, 'Status deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createStatus,
  getAllStatuses,
  getStatusById,
  updateStatus,
  updateAllStatuses,
  deleteStatus
};

