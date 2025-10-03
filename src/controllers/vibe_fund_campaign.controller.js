const VibeFundCampaign = require('../models/vibe_fund_campaign.model');
const BusinessCategory = require('../models/business_category.model');
const CompaignType = require('../models/compaign_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new vibe fund campaign
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVibeFundCampaign = asyncHandler(async (req, res) => {
  try {
    const campaignData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const campaign = await VibeFundCampaign.create(campaignData);

    // Manually populate business_category_id and compaign_type_id
    const businessCategory = await BusinessCategory.findOne({ business_category_id: campaign.business_category_id }).select('business_category_id name');
    const compaignType = await CompaignType.findOne({ compaign_type_id: campaign.compaign_type_id }).select('compaign_type_id name');

    const campaignWithDetails = campaign.toObject();
    campaignWithDetails.business_category = businessCategory;
    campaignWithDetails.compaign_type = compaignType;

    logger.info('Vibe Fund Campaign created successfully', { 
      campaignId: campaign._id, 
      vibe_fund_campaign_id: campaign.vibe_fund_campaign_id 
    });

    sendSuccess(res, campaignWithDetails, 'Vibe Fund Campaign created successfully', 201);
  } catch (error) {
    logger.error('Error creating vibe fund campaign', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all vibe fund campaigns with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVibeFundCampaign = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      approved_status,
      business_category_id,
      compaign_type_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { campaign_description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    if (approved_status !== undefined) {
      filter.approved_status = approved_status === 'true';
    }

    if (business_category_id) {
      filter.business_category_id = parseInt(business_category_id);
    }

    if (compaign_type_id) {
      filter.compaign_type_id = parseInt(compaign_type_id);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      VibeFundCampaign.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      VibeFundCampaign.countDocuments(filter)
    ]);

    // Manually populate business_category_id and compaign_type_id
    const businessCategoryIds = [...new Set(campaigns.map(c => c.business_category_id).filter(Boolean))];
    const compaignTypeIds = [...new Set(campaigns.map(c => c.compaign_type_id).filter(Boolean))];

    const [businessCategories, compaignTypes] = await Promise.all([
      BusinessCategory.find({ business_category_id: { $in: businessCategoryIds } }).select('business_category_id name'),
      CompaignType.find({ compaign_type_id: { $in: compaignTypeIds } }).select('compaign_type_id name')
    ]);

    const businessCategoryMap = {};
    businessCategories.forEach(cat => {
      businessCategoryMap[cat.business_category_id] = cat;
    });

    const compaignTypeMap = {};
    compaignTypes.forEach(type => {
      compaignTypeMap[type.compaign_type_id] = type;
    });

    const campaignsWithDetails = campaigns.map(campaign => {
      const campaignObj = campaign.toObject();
      campaignObj.business_category = businessCategoryMap[campaign.business_category_id] || null;
      campaignObj.compaign_type = compaignTypeMap[campaign.compaign_type_id] || null;
      return campaignObj;
    });

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

    logger.info('Vibe Fund Campaigns retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, campaignsWithDetails, pagination, 'Vibe Fund Campaigns retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving vibe fund campaigns', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get vibe fund campaign by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVibeFundCampaignById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await VibeFundCampaign.findOne({ vibe_fund_campaign_id: parseInt(id) });

    if (!campaign) {
      return sendNotFound(res, 'Vibe Fund Campaign not found');
    }

    // Manually populate business_category_id and compaign_type_id
    const businessCategory = await BusinessCategory.findOne({ business_category_id: campaign.business_category_id }).select('business_category_id name');
    const compaignType = await CompaignType.findOne({ compaign_type_id: campaign.compaign_type_id }).select('compaign_type_id name');

    const campaignWithDetails = campaign.toObject();
    campaignWithDetails.business_category = businessCategory;
    campaignWithDetails.compaign_type = compaignType;

    logger.info('Vibe Fund Campaign retrieved successfully', { campaignId: campaign._id });

    sendSuccess(res, campaignWithDetails, 'Vibe Fund Campaign retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving vibe fund campaign', { 
      error: error.message, 
      campaignId: req.params.id 
    });
    throw error;
  }
});

/**
 * Update vibe fund campaign by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVibeFundCampaign = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const campaign = await VibeFundCampaign.findOneAndUpdate(
      { vibe_fund_campaign_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!campaign) {
      return sendNotFound(res, 'Vibe Fund Campaign not found');
    }

    // Manually populate business_category_id and compaign_type_id
    const businessCategory = await BusinessCategory.findOne({ business_category_id: campaign.business_category_id }).select('business_category_id name');
    const compaignType = await CompaignType.findOne({ compaign_type_id: campaign.compaign_type_id }).select('compaign_type_id name');

    const campaignWithDetails = campaign.toObject();
    campaignWithDetails.business_category = businessCategory;
    campaignWithDetails.compaign_type = compaignType;

    logger.info('Vibe Fund Campaign updated successfully', { campaignId: campaign._id });

    sendSuccess(res, campaignWithDetails, 'Vibe Fund Campaign updated successfully');
  } catch (error) {
    logger.error('Error updating vibe fund campaign', { error: error.message });
    throw error;
  }
});

/**
 * Delete vibe fund campaign by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVibeFundCampaign = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await VibeFundCampaign.findOneAndUpdate(
      { vibe_fund_campaign_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!campaign) {
      return sendNotFound(res, 'Vibe Fund Campaign not found');
    }

    logger.info('Vibe Fund Campaign deleted successfully', { campaignId: campaign._id });

    sendSuccess(res, campaign, 'Vibe Fund Campaign deleted successfully');
  } catch (error) {
    logger.error('Error deleting vibe fund campaign', { 
      error: error.message, 
      campaignId: req.params.id 
    });
    throw error;
  }
});

/**
 * Get vibe fund campaigns created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVibeFundCampaignByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      approved_status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {
      created_by: req.userId
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { campaign_description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    if (approved_status !== undefined) {
      filter.approved_status = approved_status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      VibeFundCampaign.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      VibeFundCampaign.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Manually populate business_category_id and compaign_type_id
    const businessCategoryIds = [...new Set(campaigns.map(c => c.business_category_id).filter(Boolean))];
    const compaignTypeIds = [...new Set(campaigns.map(c => c.compaign_type_id).filter(Boolean))];

    const [businessCategories, compaignTypes] = await Promise.all([
      BusinessCategory.find({ business_category_id: { $in: businessCategoryIds } }).select('business_category_id name'),
      CompaignType.find({ compaign_type_id: { $in: compaignTypeIds } }).select('compaign_type_id name')
    ]);

    const businessCategoryMap = {};
    businessCategories.forEach(cat => {
      businessCategoryMap[cat.business_category_id] = cat;
    });

    const compaignTypeMap = {};
    compaignTypes.forEach(type => {
      compaignTypeMap[type.compaign_type_id] = type;
    });

    const campaignsWithDetails = campaigns.map(campaign => {
      const campaignObj = campaign.toObject();
      campaignObj.business_category = businessCategoryMap[campaign.business_category_id] || null;
      campaignObj.compaign_type = compaignTypeMap[campaign.compaign_type_id] || null;
      return campaignObj;
    });

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    };

    logger.info('User vibe fund campaigns retrieved successfully', { 
      userId: req.userId, 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, campaignsWithDetails, pagination, 'User vibe fund campaigns retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving user vibe fund campaigns', { 
      error: error.message, 
      userId: req.userId 
    });
    throw error;
  }
});

/**
 * Change approved status of vibe fund campaign
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changeApprovedStatus = asyncHandler(async (req, res) => {
  try {
    const { id, approved_status } = req.body;

    const campaign = await VibeFundCampaign.findOneAndUpdate(
      { vibe_fund_campaign_id: parseInt(id) },
      { 
        approved_status: approved_status,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!campaign) {
      return sendNotFound(res, 'Vibe Fund Campaign not found');
    }

    // Manually populate business_category_id and compaign_type_id
    const businessCategory = await BusinessCategory.findOne({ business_category_id: campaign.business_category_id }).select('business_category_id name');
    const compaignType = await CompaignType.findOne({ compaign_type_id: campaign.compaign_type_id }).select('compaign_type_id name');

    const campaignWithDetails = campaign.toObject();
    campaignWithDetails.business_category = businessCategory;
    campaignWithDetails.compaign_type = compaignType;

    logger.info('Vibe Fund Campaign approved status changed successfully', { 
      campaignId: campaign._id,
      approved_status: campaign.approved_status 
    });

    sendSuccess(res, campaignWithDetails, `Campaign ${approved_status ? 'approved' : 'rejected'} successfully`);
  } catch (error) {
    logger.error('Error changing approved status', { error: error.message });
    throw error;
  }
});

module.exports = {
  createVibeFundCampaign,
  getAllVibeFundCampaign,
  getVibeFundCampaignById,
  updateVibeFundCampaign,
  deleteVibeFundCampaign,
  getVibeFundCampaignByAuth,
  changeApprovedStatus
};

