const DesignTabsMap = require('../models/design_tabs_map.model');
const CommunityDesignsLikes = require('../models/community_designs_likes.model');
const CommunityDesignsViews = require('../models/community_designs_views.model');
const CommunityDesignsShare = require('../models/community_designs_share.model');
const CommunityDesignsRemixes = require('../models/community_designs_remixes.model');
const CommunityDesignsDownloads = require('../models/community_designs_downloads.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new design tabs map
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createDesignTabsMap = asyncHandler(async (req, res) => {
  try {
    // Create design tabs map data
    const designTabsMapData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create design tabs map
    const designTabsMap = await DesignTabsMap.create(designTabsMapData);
    
    // Return created record (will auto-populate on next request if needed)
    sendSuccess(res, designTabsMap, 'Design Tabs Map created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all design tabs maps with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllDesignTabsMaps = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      tabs_id,
      community_designs_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

  

    // Add tabs_id filter
    if (tabs_id && tabs_id !== '') {
      filter.tabs_id = parseInt(tabs_id);
    }

    // Add community_designs_id filter
    if (community_designs_id && community_designs_id !== '') {
      filter.community_designs_id = parseInt(community_designs_id);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query without population first (manual population due to custom ID fields)
    const [designTabsMaps, total] = await Promise.all([
      DesignTabsMap.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      DesignTabsMap.countDocuments(filter)
    ]);

    // Manual population for custom ID fields
    const DesignCommunityTabs = require('../models/design_community_tabs.model');
    const CommunityDesigns = require('../models/community_designs.model');
    const User = require('../models/user.model');
    const Category = require('../models/category.model');

    const populatedMaps = await Promise.all(designTabsMaps.map(async (map) => {
      const [tab, design, createdByUser, updatedByUser] = await Promise.all([
        map.tabs_id ? DesignCommunityTabs.findOne({ tabs_id: map.tabs_id }).lean() : null,
        map.community_designs_id ? CommunityDesigns.findOne({ community_designs_id: map.community_designs_id }).lean() : null,
        map.created_by ? User.findOne({ user_id: map.created_by }).select('user_id name email user_img').lean() : null,
        map.updated_by ? User.findOne({ user_id: map.updated_by }).select('user_id name email user_img').lean() : null
      ]);

      // Populate nested fields in tab
      if (tab) {
        const [tabCreatedBy, tabUpdatedBy] = await Promise.all([
          tab.created_by ? User.findOne({ user_id: tab.created_by }).select('user_id name email user_img').lean() : null,
          tab.updated_by ? User.findOne({ user_id: tab.updated_by }).select('user_id name email user_img').lean() : null
        ]);
        tab.created_by = tabCreatedBy;
        tab.updated_by = tabUpdatedBy;
      }

      // Populate nested fields in design
      if (design) {
        const [category, designCreatedBy, designUpdatedBy] = await Promise.all([
          design.categories_id ? Category.findOne({ category_id: design.categories_id }).select('category_id category_name emozi status').lean() : null,
          design.created_by ? User.findOne({ user_id: design.created_by }).select('user_id name email user_img').lean() : null,
          design.updated_by ? User.findOne({ user_id: design.updated_by }).select('user_id name email user_img').lean() : null
        ]);
        design.categories_id = category;
        design.created_by = designCreatedBy;
        design.updated_by = designUpdatedBy;
      }

      return {
        ...map,
        tabs_id: tab,
        community_designs_id: design,
        created_by: createdByUser,
        updated_by: updatedByUser
      };
    }));

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
    sendPaginated(res, populatedMaps, pagination, 'Design Tabs Maps retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get design tabs map by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDesignTabsMapById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const designTabsMap = await DesignTabsMap.findOne({design_tabs_map_id: parseInt(id)}).lean();

    if (!designTabsMap) {
      return sendNotFound(res, 'Design Tabs Map not found');
    }

    // Manual population
    const DesignCommunityTabs = require('../models/design_community_tabs.model');
    const CommunityDesigns = require('../models/community_designs.model');
    const User = require('../models/user.model');
    const Category = require('../models/category.model');

    const [tab, design, createdByUser, updatedByUser] = await Promise.all([
      designTabsMap.tabs_id ? DesignCommunityTabs.findOne({ tabs_id: designTabsMap.tabs_id }).lean() : null,
      designTabsMap.community_designs_id ? CommunityDesigns.findOne({ community_designs_id: designTabsMap.community_designs_id }).lean() : null,
      designTabsMap.created_by ? User.findOne({ user_id: designTabsMap.created_by }).select('user_id name email user_img').lean() : null,
      designTabsMap.updated_by ? User.findOne({ user_id: designTabsMap.updated_by }).select('user_id name email user_img').lean() : null
    ]);

    if (tab) {
      const [tabCreatedBy, tabUpdatedBy] = await Promise.all([
        tab.created_by ? User.findOne({ user_id: tab.created_by }).select('user_id name email user_img').lean() : null,
        tab.updated_by ? User.findOne({ user_id: tab.updated_by }).select('user_id name email user_img').lean() : null
      ]);
      tab.created_by = tabCreatedBy;
      tab.updated_by = tabUpdatedBy;
    }

    if (design) {
      const [category, designCreatedBy, designUpdatedBy] = await Promise.all([
        design.categories_id ? Category.findOne({ category_id: design.categories_id }).select('category_id category_name emozi status').lean() : null,
        design.created_by ? User.findOne({ user_id: design.created_by }).select('user_id name email user_img').lean() : null,
        design.updated_by ? User.findOne({ user_id: design.updated_by }).select('user_id name email user_img').lean() : null
      ]);
      design.categories_id = category;
      design.created_by = designCreatedBy;
      design.updated_by = designUpdatedBy;
    }

    const populatedMap = {
      ...designTabsMap,
      tabs_id: tab,
      community_designs_id: design,
      created_by: createdByUser,
      updated_by: updatedByUser
    };

    sendSuccess(res, populatedMap, 'Design Tabs Map retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get designs by tab ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDesignsByTabId = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {
      tabs_id: parseInt(id)
    };

    filter.created_by = req.userId;
    // Add status filter
    if (status !== undefined && status !== '') {
      filter.status = true;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with population
    const [designTabsMaps, total] = await Promise.all([
      DesignTabsMap.find(filter)
        .populate('tabs_id', 'tabs_id name emoji status')
        .populate({
          path: 'community_designs_id',
          select: 'community_designs_id title sub_title image image_type image_sell_type hash_tag likes views share remixes downloads status created_at updated_at',
          populate: [
            { path: 'categories_id', select: 'category_id category_name emozi status' },
            { path: 'created_by', select: 'user_id name email user_img' },
            { path: 'updated_by', select: 'user_id name email user_img' }
          ]
        })
        .populate('created_by', 'user_id name email user_img')
        .populate('updated_by', 'user_id name email user_img')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      DesignTabsMap.countDocuments(filter)
    ]);

    // Fetch detailed interaction data for each design
    const detailsPromises = designTabsMaps.map(async (tabMap) => {
      // Check if community_designs_id exists and is populated
      if (!tabMap.community_designs_id || !tabMap.community_designs_id.community_designs_id) {
        return {
          ...tabMap.toObject(),
          interaction_details: null
        };
      }

      const designId = tabMap.community_designs_id.community_designs_id;

      // Fetch counts and details for each interaction type with populated user data
      const [
        likesData,
        viewsData,
        shareData,
        remixesData,
        downloadsData
      ] = await Promise.all([
        CommunityDesignsLikes.find({ community_designs_id: designId, status: true })
          .populate('created_by', 'user_id name email user_img')
          .populate('updated_by', 'user_id name email user_img'),
        CommunityDesignsViews.find({ community_designs_id: designId, status: true })
          .populate('created_by', 'user_id name email user_img')
          .populate('updated_by', 'user_id name email user_img'),
        CommunityDesignsShare.find({ community_designs_id: designId, status: true })
          .populate('created_by', 'user_id name email user_img')
          .populate('updated_by', 'user_id name email user_img'),
        CommunityDesignsRemixes.find({ community_designs_id: designId, status: true })
          .populate('created_by', 'user_id name email user_img')
          .populate('updated_by', 'user_id name email user_img'),
        CommunityDesignsDownloads.find({ community_designs_id: designId, status: true })
          .populate('created_by', 'user_id name email user_img')
          .populate('updated_by', 'user_id name email user_img')
      ]);

      return {
        ...tabMap.toObject(),
        interaction_details: {
          likes: {
            count: likesData.length,
            details: likesData
          },
          views: {
            count: viewsData.length,
            details: viewsData
          },
          share: {
            count: shareData.length,
            details: shareData
          },
          remixes: {
            count: remixesData.length,
            details: remixesData
          },
          downloads: {
            count: downloadsData.length,
            details: downloadsData
          }
        }
      };
    });

    const designsWithDetails = await Promise.all(detailsPromises);

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
    sendPaginated(res, designsWithDetails, pagination, 'Designs by tab ID retrieved successfully with interaction details');
  } catch (error) {
    throw error;
  }
});

/**
 * Update design tabs map by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateDesignTabsMap = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    let designTabsMap = await DesignTabsMap.findOneAndUpdate(
      {design_tabs_map_id: parseInt(id)},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    ).lean();

    if (!designTabsMap) {
      return sendNotFound(res, 'Design Tabs Map not found');
    }

    // Manual population
    const DesignCommunityTabs = require('../models/design_community_tabs.model');
    const CommunityDesigns = require('../models/community_designs.model');
    const User = require('../models/user.model');
    const Category = require('../models/category.model');

    const [tab, design, createdByUser, updatedByUser] = await Promise.all([
      designTabsMap.tabs_id ? DesignCommunityTabs.findOne({ tabs_id: designTabsMap.tabs_id }).lean() : null,
      designTabsMap.community_designs_id ? CommunityDesigns.findOne({ community_designs_id: designTabsMap.community_designs_id }).lean() : null,
      designTabsMap.created_by ? User.findOne({ user_id: designTabsMap.created_by }).select('user_id name email user_img').lean() : null,
      designTabsMap.updated_by ? User.findOne({ user_id: designTabsMap.updated_by }).select('user_id name email user_img').lean() : null
    ]);

    if (tab) {
      const [tabCreatedBy, tabUpdatedBy] = await Promise.all([
        tab.created_by ? User.findOne({ user_id: tab.created_by }).select('user_id name email user_img').lean() : null,
        tab.updated_by ? User.findOne({ user_id: tab.updated_by }).select('user_id name email user_img').lean() : null
      ]);
      tab.created_by = tabCreatedBy;
      tab.updated_by = tabUpdatedBy;
    }

    if (design) {
      const [category, designCreatedBy, designUpdatedBy] = await Promise.all([
        design.categories_id ? Category.findOne({ category_id: design.categories_id }).select('category_id category_name emozi status').lean() : null,
        design.created_by ? User.findOne({ user_id: design.created_by }).select('user_id name email user_img').lean() : null,
        design.updated_by ? User.findOne({ user_id: design.updated_by }).select('user_id name email user_img').lean() : null
      ]);
      design.categories_id = category;
      design.created_by = designCreatedBy;
      design.updated_by = designUpdatedBy;
    }

    designTabsMap = {
      ...designTabsMap,
      tabs_id: tab,
      community_designs_id: design,
      created_by: createdByUser,
      updated_by: updatedByUser
    };

    sendSuccess(res, designTabsMap, 'Design Tabs Map updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete design tabs map by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteDesignTabsMap = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let designTabsMap = await DesignTabsMap.findOneAndUpdate(
      {design_tabs_map_id: parseInt(id)},
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    ).lean();

    if (!designTabsMap) {
      return sendNotFound(res, 'Design Tabs Map not found');
    }

    // Manual population
    const DesignCommunityTabs = require('../models/design_community_tabs.model');
    const CommunityDesigns = require('../models/community_designs.model');
    const User = require('../models/user.model');
    const Category = require('../models/category.model');

    const [tab, design, createdByUser, updatedByUser] = await Promise.all([
      designTabsMap.tabs_id ? DesignCommunityTabs.findOne({ tabs_id: designTabsMap.tabs_id }).lean() : null,
      designTabsMap.community_designs_id ? CommunityDesigns.findOne({ community_designs_id: designTabsMap.community_designs_id }).lean() : null,
      designTabsMap.created_by ? User.findOne({ user_id: designTabsMap.created_by }).select('user_id name email user_img').lean() : null,
      designTabsMap.updated_by ? User.findOne({ user_id: designTabsMap.updated_by }).select('user_id name email user_img').lean() : null
    ]);

    if (tab) {
      const [tabCreatedBy, tabUpdatedBy] = await Promise.all([
        tab.created_by ? User.findOne({ user_id: tab.created_by }).select('user_id name email user_img').lean() : null,
        tab.updated_by ? User.findOne({ user_id: tab.updated_by }).select('user_id name email user_img').lean() : null
      ]);
      tab.created_by = tabCreatedBy;
      tab.updated_by = tabUpdatedBy;
    }

    if (design) {
      const [category, designCreatedBy, designUpdatedBy] = await Promise.all([
        design.categories_id ? Category.findOne({ category_id: design.categories_id }).select('category_id category_name emozi status').lean() : null,
        design.created_by ? User.findOne({ user_id: design.created_by }).select('user_id name email user_img').lean() : null,
        design.updated_by ? User.findOne({ user_id: design.updated_by }).select('user_id name email user_img').lean() : null
      ]);
      design.categories_id = category;
      design.created_by = designCreatedBy;
      design.updated_by = designUpdatedBy;
    }

    designTabsMap = {
      ...designTabsMap,
      tabs_id: tab,
      community_designs_id: design,
      created_by: createdByUser,
      updated_by: updatedByUser
    };

    sendSuccess(res, designTabsMap, 'Design Tabs Map deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createDesignTabsMap,
  getAllDesignTabsMaps,
  getDesignTabsMapById,
  getDesignsByTabId,
  updateDesignTabsMap,
  deleteDesignTabsMap
};

