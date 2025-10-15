const CommunityDesigns = require('../models/community_designs.model');
const CommunityDesignsLikes = require('../models/community_designs_likes.model');
const CommunityDesignsViews = require('../models/community_designs_views.model');
const CommunityDesignsShare = require('../models/community_designs_share.model');
const CommunityDesignsRemixes = require('../models/community_designs_remixes.model');
const CommunityDesignsDownloads = require('../models/community_designs_downloads.model');
const User = require('../models/user.model');
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
    // Get all community designs (no pagination, search, or filters)
    const communityDesigns = await CommunityDesigns.find()
      .sort({ created_at: -1 });

    sendSuccess(res, communityDesigns, 'Community Designs retrieved successfully');
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

/**
 * Add collaborator to community design by email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addCollaborator = asyncHandler(async (req, res) => {
  try {
    const { community_designs_id, email, permission = 'View' } = req.body;

    // Find the community design
    const communityDesign = await CommunityDesigns.findOne({ 
      community_designs_id: parseInt(community_designs_id) 
    });

    if (!communityDesign) {
      return sendNotFound(res, 'Community Design not found');
    }

    // Check if user owns this design or has edit permission
    const isOwner = communityDesign.created_by === req.userId;
    let hasEditPermission = false;

    if (!isOwner && communityDesign.collaborators_user_id) {
      const userCollaboration = communityDesign.collaborators_user_id.find(
        collab => collab.id === req.userId && collab.permission === 'Edit'
      );
      hasEditPermission = !!userCollaboration;
    }

    if (!isOwner && !hasEditPermission) {
      return sendError(res, 'You do not have permission to add collaborators to this design', 403);
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return sendNotFound(res, 'User not found with this email address');
    }

    // Check if user is already a collaborator
    if (communityDesign.collaborators_user_id) {
      const existingCollaborator = communityDesign.collaborators_user_id.find(
        collab => collab.id === user.user_id
      );

      if (existingCollaborator) {
        return sendError(res, 'User is already a collaborator on this design', 400);
      }
    }

    // Check if user is trying to add themselves
    if (user.user_id === req.userId) {
      return sendError(res, 'You cannot add yourself as a collaborator', 400);
    }

    // Initialize collaborators array if it doesn't exist
    if (!communityDesign.collaborators_user_id) {
      communityDesign.collaborators_user_id = [];
    }

    // Add the new collaborator
    communityDesign.collaborators_user_id.push({
      id: user.user_id,
      permission: permission
    });

    // Update the community design
    const updatedCommunityDesign = await CommunityDesigns.findOneAndUpdate(
      { community_designs_id: parseInt(community_designs_id) },
      { 
        collaborators_user_id: communityDesign.collaborators_user_id,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );

    sendSuccess(res, {
      community_designs_id: updatedCommunityDesign.community_designs_id,
      collaborator: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        permission: permission
      },
      message: 'Collaborator added successfully'
    }, 'Collaborator added successfully');

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
  deleteCommunityDesign,
  addCollaborator
};

