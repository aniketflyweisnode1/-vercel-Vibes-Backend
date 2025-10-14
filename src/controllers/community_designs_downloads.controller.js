const CommunityDesignsDownloads = require('../models/community_designs_downloads.model');
const CommunityDesigns = require('../models/community_designs.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new community design download and update downloads count
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCommunityDesignDownload = asyncHandler(async (req, res) => {
  try {
    const { community_designs_id } = req.body;

    // Check if community design exists
    const communityDesign = await CommunityDesigns.findOne({community_designs_id: parseInt(community_designs_id)});
    if (!communityDesign) {
      return sendNotFound(res, 'Community Design not found');
    }

    // Create community design download data
    const communityDesignDownloadData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create community design download
    const communityDesignDownload = await CommunityDesignsDownloads.create(communityDesignDownloadData);

    // Update downloads count in community design
    await CommunityDesigns.findOneAndUpdate(
      {community_designs_id: parseInt(community_designs_id)},
      { $inc: { downloads: 1 } }
    );

    sendSuccess(res, communityDesignDownload, 'Community Design Download created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all community design downloads with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCommunityDesignDownloads = asyncHandler(async (req, res) => {
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
    const [communityDesignDownloads, total] = await Promise.all([
      CommunityDesignsDownloads.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      CommunityDesignsDownloads.countDocuments(filter)
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
    sendPaginated(res, communityDesignDownloads, pagination, 'Community Design Downloads retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get community design download by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCommunityDesignDownloadById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const communityDesignDownload = await CommunityDesignsDownloads.findOne({community_designs_downloads_id: parseInt(id)});

    if (!communityDesignDownload) {
      return sendNotFound(res, 'Community Design Download not found');
    }
    sendSuccess(res, communityDesignDownload, 'Community Design Download retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update community design download by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCommunityDesignDownload = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const communityDesignDownload = await CommunityDesignsDownloads.findOneAndUpdate(
      {community_designs_downloads_id: parseInt(id)},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!communityDesignDownload) {
      return sendNotFound(res, 'Community Design Download not found');
    }
    sendSuccess(res, communityDesignDownload, 'Community Design Download updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete community design download by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCommunityDesignDownload = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const communityDesignDownload = await CommunityDesignsDownloads.findOneAndUpdate(
      {community_designs_downloads_id: parseInt(id)},
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!communityDesignDownload) {
      return sendNotFound(res, 'Community Design Download not found');
    }
    sendSuccess(res, communityDesignDownload, 'Community Design Download deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createCommunityDesignDownload,
  getAllCommunityDesignDownloads,
  getCommunityDesignDownloadById,
  updateCommunityDesignDownload,
  deleteCommunityDesignDownload
};

