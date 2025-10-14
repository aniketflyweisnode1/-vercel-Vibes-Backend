const CommunityDesignsRemixes = require('../models/community_designs_remixes.model');
const CommunityDesigns = require('../models/community_designs.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new community design remix and update remixes count
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCommunityDesignRemix = asyncHandler(async (req, res) => {
  try {
    const { community_designs_id } = req.body;

    // Check if community design exists
    const communityDesign = await CommunityDesigns.findOne({community_designs_id: parseInt(community_designs_id)});
    if (!communityDesign) {
      return sendNotFound(res, 'Community Design not found');
    }

    // Create community design remix data
    const communityDesignRemixData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create community design remix
    const communityDesignRemix = await CommunityDesignsRemixes.create(communityDesignRemixData);

    // Update remixes count in community design
    await CommunityDesigns.findOneAndUpdate(
      {community_designs_id: parseInt(community_designs_id)},
      { $inc: { remixes: 1 } }
    );

    sendSuccess(res, communityDesignRemix, 'Community Design Remix created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all community design remixes with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCommunityDesignRemixes = asyncHandler(async (req, res) => {
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
    const [communityDesignRemixes, total] = await Promise.all([
      CommunityDesignsRemixes.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      CommunityDesignsRemixes.countDocuments(filter)
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
    sendPaginated(res, communityDesignRemixes, pagination, 'Community Design Remixes retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get community design remix by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCommunityDesignRemixById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const communityDesignRemix = await CommunityDesignsRemixes.findOne({community_designs_remixes_id: parseInt(id)});

    if (!communityDesignRemix) {
      return sendNotFound(res, 'Community Design Remix not found');
    }
    sendSuccess(res, communityDesignRemix, 'Community Design Remix retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update community design remix by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCommunityDesignRemix = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const communityDesignRemix = await CommunityDesignsRemixes.findOneAndUpdate(
      {community_designs_remixes_id: parseInt(id)},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!communityDesignRemix) {
      return sendNotFound(res, 'Community Design Remix not found');
    }
    sendSuccess(res, communityDesignRemix, 'Community Design Remix updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete community design remix by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCommunityDesignRemix = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const communityDesignRemix = await CommunityDesignsRemixes.findOneAndUpdate(
      {community_designs_remixes_id: parseInt(id)},
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!communityDesignRemix) {
      return sendNotFound(res, 'Community Design Remix not found');
    }
    sendSuccess(res, communityDesignRemix, 'Community Design Remix deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createCommunityDesignRemix,
  getAllCommunityDesignRemixes,
  getCommunityDesignRemixById,
  updateCommunityDesignRemix,
  deleteCommunityDesignRemix
};

