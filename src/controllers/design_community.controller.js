const DesignCommunity = require('../models/design_community.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new design community
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createDesignCommunity = asyncHandler(async (req, res) => {
  try {
    // Create design community data
    const designCommunityData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create design community
    const designCommunity = await DesignCommunity.create(designCommunityData);
    sendSuccess(res, designCommunity, 'Design Community created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all design communities with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllDesignCommunities = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      event_id,
      invited_user_id,
      approval,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { emoji: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = 'true';
    }

    // Add event_id filter
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [designCommunities, total] = await Promise.all([
      DesignCommunity.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      DesignCommunity.countDocuments(filter)
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
    sendPaginated(res, designCommunities, pagination, 'Design Communities retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get design community by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDesignCommunityById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const designCommunity = await DesignCommunity.findOne({design_community_id: parseInt(id)});

    if (!designCommunity) {
      return sendNotFound(res, 'Design Community not found');
    }
    sendSuccess(res, designCommunity, 'Design Community retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update design community by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateDesignCommunity = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const designCommunity = await DesignCommunity.findOneAndUpdate(
      {design_community_id: parseInt(id)},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!designCommunity) {
      return sendNotFound(res, 'Design Community not found');
    }
    sendSuccess(res, designCommunity, 'Design Community updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete design community by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteDesignCommunity = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const designCommunity = await DesignCommunity.findOneAndUpdate(
      {design_community_id: parseInt(id)},
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!designCommunity) {
      return sendNotFound(res, 'Design Community not found');
    }
    sendSuccess(res, designCommunity, 'Design Community deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get design communities created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDesignCommunitiesByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      event_id,
      invited_user_id,
      approval,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object - only show design communities created by the authenticated user
    const filter = {
      created_by: req.userId
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { emoji: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = 'true';
    }

    // Add event_id filter
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }

    // Add invited_user_id filter
    if (invited_user_id) {
      filter.invited_user_id = parseInt(invited_user_id);
    }

    // Add approval filter
    if (approval) {
      filter.approval = approval;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [designCommunities, total] = await Promise.all([
      DesignCommunity.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      DesignCommunity.countDocuments(filter)
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
    sendPaginated(res, designCommunities, pagination, 'User design communities retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createDesignCommunity,
  getAllDesignCommunities,
  getDesignCommunityById,
  updateDesignCommunity,
  deleteDesignCommunity,
  getDesignCommunitiesByAuth
};

