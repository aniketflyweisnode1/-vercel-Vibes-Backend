const DesignCommunityTabs = require('../models/design_community_tabs.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new design community tab
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createDesignCommunityTab = asyncHandler(async (req, res) => {
  try {
    // Create design community tab data
    const designCommunityTabData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create design community tab
    const designCommunityTab = await DesignCommunityTabs.create(designCommunityTabData);
    sendSuccess(res, designCommunityTab, 'Design Community Tab created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all design community tabs with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllDesignCommunityTabs = asyncHandler(async (req, res) => {
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
        { emoji: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
  

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [designCommunityTabs, total] = await Promise.all([
      DesignCommunityTabs.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      DesignCommunityTabs.countDocuments(filter)
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
    sendPaginated(res, designCommunityTabs, pagination, 'Design Community Tabs retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get design community tab by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDesignCommunityTabById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const designCommunityTab = await DesignCommunityTabs.findOne({tabs_id: parseInt(id)});

    if (!designCommunityTab) {
      return sendNotFound(res, 'Design Community Tab not found');
    }
    sendSuccess(res, designCommunityTab, 'Design Community Tab retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update design community tab by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateDesignCommunityTab = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const designCommunityTab = await DesignCommunityTabs.findOneAndUpdate(
      {tabs_id: parseInt(id)},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!designCommunityTab) {
      return sendNotFound(res, 'Design Community Tab not found');
    }
    sendSuccess(res, designCommunityTab, 'Design Community Tab updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete design community tab by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteDesignCommunityTab = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const designCommunityTab = await DesignCommunityTabs.findOneAndUpdate(
      {tabs_id: parseInt(id)},
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!designCommunityTab) {
      return sendNotFound(res, 'Design Community Tab not found');
    }
    sendSuccess(res, designCommunityTab, 'Design Community Tab deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get design community tabs created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDesignCommunityTabsByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object - only show design community tabs created by the authenticated user
    const filter = {
      created_by: req.userId
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { emoji: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
  

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [designCommunityTabs, total] = await Promise.all([
      DesignCommunityTabs.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      DesignCommunityTabs.countDocuments(filter)
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
    sendPaginated(res, designCommunityTabs, pagination, 'User design community tabs retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createDesignCommunityTab,
  getAllDesignCommunityTabs,
  getDesignCommunityTabById,
  updateDesignCommunityTab,
  deleteDesignCommunityTab,
  getDesignCommunityTabsByAuth
};

