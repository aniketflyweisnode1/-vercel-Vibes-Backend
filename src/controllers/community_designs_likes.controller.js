const CommunityDesignsLikes = require('../models/community_designs_likes.model');
const CommunityDesigns = require('../models/community_designs.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new community design like and update likes count
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCommunityDesignLike = asyncHandler(async (req, res) => {
  try {
    const { community_designs_id } = req.body;

    // Check if community design exists
    const communityDesign = await CommunityDesigns.findOne({community_designs_id: parseInt(community_designs_id)});
    if (!communityDesign) {
      return sendNotFound(res, 'Community Design not found');
    }

    // Create community design like data
    const communityDesignLikeData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create community design like
    const communityDesignLike = await CommunityDesignsLikes.create(communityDesignLikeData);

    // Update likes count in community design
    await CommunityDesigns.findOneAndUpdate(
      {community_designs_id: parseInt(community_designs_id)},
      { $inc: { likes: 1 } }
    );

    sendSuccess(res, communityDesignLike, 'Community Design Like created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all community design likes with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCommunityDesignLikes = asyncHandler(async (req, res) => {
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
  

    // Add community_designs_id filter
    if (community_designs_id) {
      filter.community_designs_id = parseInt(community_designs_id);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [communityDesignLikes, total] = await Promise.all([
      CommunityDesignsLikes.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      CommunityDesignsLikes.countDocuments(filter)
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
    sendPaginated(res, communityDesignLikes, pagination, 'Community Design Likes retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get community design like by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCommunityDesignLikeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const communityDesignLike = await CommunityDesignsLikes.findOne({community_designs_likes_id: parseInt(id)});

    if (!communityDesignLike) {
      return sendNotFound(res, 'Community Design Like not found');
    }
    sendSuccess(res, communityDesignLike, 'Community Design Like retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update community design like by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCommunityDesignLike = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const communityDesignLike = await CommunityDesignsLikes.findOneAndUpdate(
      {community_designs_likes_id: parseInt(id)},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!communityDesignLike) {
      return sendNotFound(res, 'Community Design Like not found');
    }
    sendSuccess(res, communityDesignLike, 'Community Design Like updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete community design like by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCommunityDesignLike = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const communityDesignLike = await CommunityDesignsLikes.findOneAndUpdate(
      {community_designs_likes_id: parseInt(id)},
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!communityDesignLike) {
      return sendNotFound(res, 'Community Design Like not found');
    }
    sendSuccess(res, communityDesignLike, 'Community Design Like deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createCommunityDesignLike,
  getAllCommunityDesignLikes,
  getCommunityDesignLikeById,
  updateCommunityDesignLike,
  deleteCommunityDesignLike
};

