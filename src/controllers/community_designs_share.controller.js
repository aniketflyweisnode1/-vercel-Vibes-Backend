const CommunityDesignsShare = require('../models/community_designs_share.model');
const CommunityDesigns = require('../models/community_designs.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new community design share and update share count
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCommunityDesignShare = asyncHandler(async (req, res) => {
  try {
    const { community_designs_id } = req.body;

    // Check if community design exists
    const communityDesign = await CommunityDesigns.findOne({community_designs_id: parseInt(community_designs_id)});
    if (!communityDesign) {
      return sendNotFound(res, 'Community Design not found');
    }

    // Create community design share data
    const communityDesignShareData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create community design share
    const communityDesignShare = await CommunityDesignsShare.create(communityDesignShareData);

    // Update share count in community design
    await CommunityDesigns.findOneAndUpdate(
      {community_designs_id: parseInt(community_designs_id)},
      { $inc: { share: 1 } }
    );

    sendSuccess(res, communityDesignShare, 'Community Design Share created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all community design shares with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCommunityDesignShares = asyncHandler(async (req, res) => {
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
    const [communityDesignShares, total] = await Promise.all([
      CommunityDesignsShare.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      CommunityDesignsShare.countDocuments(filter)
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
    sendPaginated(res, communityDesignShares, pagination, 'Community Design Shares retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get community design share by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCommunityDesignShareById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const communityDesignShare = await CommunityDesignsShare.findOne({community_designs_share_id: parseInt(id)});

    if (!communityDesignShare) {
      return sendNotFound(res, 'Community Design Share not found');
    }
    sendSuccess(res, communityDesignShare, 'Community Design Share retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update community design share by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCommunityDesignShare = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const communityDesignShare = await CommunityDesignsShare.findOneAndUpdate(
      {community_designs_share_id: parseInt(id)},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!communityDesignShare) {
      return sendNotFound(res, 'Community Design Share not found');
    }
    sendSuccess(res, communityDesignShare, 'Community Design Share updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete community design share by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCommunityDesignShare = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const communityDesignShare = await CommunityDesignsShare.findOneAndUpdate(
      {community_designs_share_id: parseInt(id)},
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!communityDesignShare) {
      return sendNotFound(res, 'Community Design Share not found');
    }
    sendSuccess(res, communityDesignShare, 'Community Design Share deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createCommunityDesignShare,
  getAllCommunityDesignShares,
  getCommunityDesignShareById,
  updateCommunityDesignShare,
  deleteCommunityDesignShare
};

