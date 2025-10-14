const CommunityDesignsViews = require('../models/community_designs_views.model');
const CommunityDesigns = require('../models/community_designs.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new community design view and update views count
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCommunityDesignView = asyncHandler(async (req, res) => {
  try {
    const { community_designs_id } = req.body;

    // Check if community design exists
    const communityDesign = await CommunityDesigns.findOne({community_designs_id: parseInt(community_designs_id)});
    if (!communityDesign) {
      return sendNotFound(res, 'Community Design not found');
    }

    // Create community design view data
    const communityDesignViewData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create community design view
    const communityDesignView = await CommunityDesignsViews.create(communityDesignViewData);

    // Update views count in community design
    await CommunityDesigns.findOneAndUpdate(
      {community_designs_id: parseInt(community_designs_id)},
      { $inc: { views: 1 } }
    );

    sendSuccess(res, communityDesignView, 'Community Design View created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all community design views with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCommunityDesignViews = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      community_designs_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add status filter
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Add community_designs_id filter
    if (community_designs_id) {
      filter.community_designs_id = parseInt(community_designs_id);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [communityDesignViews, total] = await Promise.all([
      CommunityDesignsViews.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      CommunityDesignsViews.countDocuments(filter)
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
    sendPaginated(res, communityDesignViews, pagination, 'Community Design Views retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get community design view by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCommunityDesignViewById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const communityDesignView = await CommunityDesignsViews.findOne({community_designs_views_id: parseInt(id)});

    if (!communityDesignView) {
      return sendNotFound(res, 'Community Design View not found');
    }
    sendSuccess(res, communityDesignView, 'Community Design View retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update community design view by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCommunityDesignView = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const communityDesignView = await CommunityDesignsViews.findOneAndUpdate(
      {community_designs_views_id: parseInt(id)},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!communityDesignView) {
      return sendNotFound(res, 'Community Design View not found');
    }
    sendSuccess(res, communityDesignView, 'Community Design View updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete community design view by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCommunityDesignView = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const communityDesignView = await CommunityDesignsViews.findOneAndUpdate(
      {community_designs_views_id: parseInt(id)},
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!communityDesignView) {
      return sendNotFound(res, 'Community Design View not found');
    }
    sendSuccess(res, communityDesignView, 'Community Design View deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createCommunityDesignView,
  getAllCommunityDesignViews,
  getCommunityDesignViewById,
  updateCommunityDesignView,
  deleteCommunityDesignView
};

