const CommunityDesigns = require('../models/community_designs.model');
const CommunityDesignsLikes = require('../models/community_designs_likes.model');
const CommunityDesignsViews = require('../models/community_designs_views.model');
const CommunityDesignsShare = require('../models/community_designs_share.model');
const CommunityDesignsRemixes = require('../models/community_designs_remixes.model');
const CommunityDesignsDownloads = require('../models/community_designs_downloads.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new community design
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCommunityDesign = asyncHandler(async (req, res) => {
  try {
    // Create community design data
    const communityDesignData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create community design
    const communityDesign = await CommunityDesigns.create(communityDesignData);
    sendSuccess(res, communityDesign, 'Community Design created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all community designs with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCommunityDesigns = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      categories_id,
      image_type,
      image_sell_type,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { sub_title: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Add categories_id filter
    if (categories_id) {
      filter.categories_id = parseInt(categories_id);
    }

    // Add image_type filter
    if (image_type) {
      filter.image_type = image_type;
    }

    // Add image_sell_type filter
    if (image_sell_type) {
      filter.image_sell_type = image_sell_type;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with population
    const [communityDesigns, total] = await Promise.all([
      CommunityDesigns.find(filter)
        .populate('categories_id', 'category_id category_name emozi status')
        .populate('created_by', 'user_id name email user_img')
        .populate('updated_by', 'user_id name email user_img')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      CommunityDesigns.countDocuments(filter)
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
    sendPaginated(res, communityDesigns, pagination, 'Community Designs retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get community design by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCommunityDesignById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const communityDesign = await CommunityDesigns.findOne({community_designs_id: parseInt(id)})
      .populate('categories_id', 'category_id category_name emozi status')
      .populate('created_by', 'user_id name email user_img')
      .populate('updated_by', 'user_id name email user_img');

    if (!communityDesign) {
      return sendNotFound(res, 'Community Design not found');
    }
    sendSuccess(res, communityDesign, 'Community Design retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get community designs by category ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCommunityDesignsByCategoryId = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {
      categories_id: parseInt(id)
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { sub_title: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with population
    const [communityDesigns, total] = await Promise.all([
      CommunityDesigns.find(filter)
        .populate('categories_id', 'category_id category_name emozi status')
        .populate('created_by', 'user_id name email user_img')
        .populate('updated_by', 'user_id name email user_img')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      CommunityDesigns.countDocuments(filter)
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
    sendPaginated(res, communityDesigns, pagination, 'Community Designs by category retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update community design by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCommunityDesign = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const communityDesign = await CommunityDesigns.findOneAndUpdate(
      {community_designs_id: parseInt(id)},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!communityDesign) {
      return sendNotFound(res, 'Community Design not found');
    }
    sendSuccess(res, communityDesign, 'Community Design updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete community design by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCommunityDesign = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const communityDesign = await CommunityDesigns.findOneAndUpdate(
      {community_designs_id: parseInt(id)},
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!communityDesign) {
      return sendNotFound(res, 'Community Design not found');
    }
    sendSuccess(res, communityDesign, 'Community Design deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createCommunityDesign,
  getAllCommunityDesigns,
  getCommunityDesignById,
  getCommunityDesignsByCategoryId,
  updateCommunityDesign,
  deleteCommunityDesign
};

