const VibeFundingCampaign = require('../models/vibe_funding_campaign.model');
const User = require('../models/user.model');
const VibeFundCampaign = require('../models/vibe_fund_campaign.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new vibe funding campaign contribution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVibeFundingCampaign = asyncHandler(async (req, res) => {
  try {
    const fundingData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const funding = await VibeFundingCampaign.create(fundingData);

    // Manually populate fundby_user_id
    const fundbyUser = await User.findOne({ user_id: funding.fundby_user_id }).select('user_id name email mobile user_img');
    const campaign = await VibeFundCampaign.findOne({ vibe_fund_campaign_id: funding.vibe_fund_campaign_id }).select('vibe_fund_campaign_id title funding_goal');

    const fundingWithDetails = funding.toObject();
    fundingWithDetails.fundby_user = fundbyUser;
    fundingWithDetails.campaign = campaign;

    logger.info('Vibe Funding Campaign created successfully', { 
      fundingId: funding._id, 
      vibe_funding_campaign_id: funding.vibe_funding_campaign_id 
    });

    sendSuccess(res, fundingWithDetails, 'Funding contribution created successfully', 201);
  } catch (error) {
    logger.error('Error creating vibe funding campaign', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all vibe funding campaigns with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVibeFundingCampaign = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      vibe_fund_campaign_id,
      fundby_user_id,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (vibe_fund_campaign_id) {
      filter.vibe_fund_campaign_id = parseInt(vibe_fund_campaign_id);
    }

    if (fundby_user_id) {
      filter.fundby_user_id = parseInt(fundby_user_id);
    }

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [fundings, total] = await Promise.all([
      VibeFundingCampaign.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      VibeFundingCampaign.countDocuments(filter)
    ]);

    // Manually populate fundby_user_id and vibe_fund_campaign_id
    const userIds = [...new Set(fundings.map(f => f.fundby_user_id).filter(Boolean))];
    const campaignIds = [...new Set(fundings.map(f => f.vibe_fund_campaign_id).filter(Boolean))];

    const [users, campaigns] = await Promise.all([
      User.find({ user_id: { $in: userIds } }).select('user_id name email mobile user_img'),
      VibeFundCampaign.find({ vibe_fund_campaign_id: { $in: campaignIds } }).select('vibe_fund_campaign_id title funding_goal')
    ]);

    const userMap = {};
    users.forEach(user => {
      userMap[user.user_id] = user;
    });

    const campaignMap = {};
    campaigns.forEach(campaign => {
      campaignMap[campaign.vibe_fund_campaign_id] = campaign;
    });

    const fundingsWithDetails = fundings.map(funding => {
      const fundingObj = funding.toObject();
      fundingObj.fundby_user = userMap[funding.fundby_user_id] || null;
      fundingObj.campaign = campaignMap[funding.vibe_fund_campaign_id] || null;
      return fundingObj;
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

    logger.info('Vibe Funding Campaigns retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, fundingsWithDetails, pagination, 'Funding contributions retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving vibe funding campaigns', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get vibe funding campaign by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVibeFundingCampaignById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const funding = await VibeFundingCampaign.findOne({ vibe_funding_campaign_id: parseInt(id) });

    if (!funding) {
      return sendNotFound(res, 'Funding contribution not found');
    }

    // Manually populate fundby_user_id
    const fundbyUser = await User.findOne({ user_id: funding.fundby_user_id }).select('user_id name email mobile user_img');
    const campaign = await VibeFundCampaign.findOne({ vibe_fund_campaign_id: funding.vibe_fund_campaign_id }).select('vibe_fund_campaign_id title funding_goal');

    const fundingWithDetails = funding.toObject();
    fundingWithDetails.fundby_user = fundbyUser;
    fundingWithDetails.campaign = campaign;

    logger.info('Vibe Funding Campaign retrieved successfully', { fundingId: funding._id });

    sendSuccess(res, fundingWithDetails, 'Funding contribution retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving vibe funding campaign', { 
      error: error.message, 
      fundingId: req.params.id 
    });
    throw error;
  }
});

/**
 * Update vibe funding campaign by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVibeFundingCampaign = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const funding = await VibeFundingCampaign.findOneAndUpdate(
      { vibe_funding_campaign_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!funding) {
      return sendNotFound(res, 'Funding contribution not found');
    }

    // Manually populate fundby_user_id
    const fundbyUser = await User.findOne({ user_id: funding.fundby_user_id }).select('user_id name email mobile user_img');
    const campaign = await VibeFundCampaign.findOne({ vibe_fund_campaign_id: funding.vibe_fund_campaign_id }).select('vibe_fund_campaign_id title funding_goal');

    const fundingWithDetails = funding.toObject();
    fundingWithDetails.fundby_user = fundbyUser;
    fundingWithDetails.campaign = campaign;

    logger.info('Vibe Funding Campaign updated successfully', { fundingId: funding._id });

    sendSuccess(res, fundingWithDetails, 'Funding contribution updated successfully');
  } catch (error) {
    logger.error('Error updating vibe funding campaign', { error: error.message });
    throw error;
  }
});

/**
 * Delete vibe funding campaign by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVibeFundingCampaign = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const funding = await VibeFundingCampaign.findOneAndUpdate(
      { vibe_funding_campaign_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!funding) {
      return sendNotFound(res, 'Funding contribution not found');
    }

    logger.info('Vibe Funding Campaign deleted successfully', { fundingId: funding._id });

    sendSuccess(res, funding, 'Funding contribution deleted successfully');
  } catch (error) {
    logger.error('Error deleting vibe funding campaign', { 
      error: error.message, 
      fundingId: req.params.id 
    });
    throw error;
  }
});

module.exports = {
  createVibeFundingCampaign,
  getAllVibeFundingCampaign,
  getVibeFundingCampaignById,
  updateVibeFundingCampaign,
  deleteVibeFundingCampaign
};

