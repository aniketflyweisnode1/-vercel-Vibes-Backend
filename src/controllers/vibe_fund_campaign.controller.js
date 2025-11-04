const VibeFundCampaign = require('../models/vibe_fund_campaign.model');
const VibeFundingCampaign = require('../models/vibe_funding_campaign.model');
const Disbursement = require('../models/disbursement.model');
const User = require('../models/user.model');
const BankName = require('../models/bank_name.model');
const BusinessCategory = require('../models/business_category.model');
const CompaignType = require('../models/compaign_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

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
    sendSuccess(res, campaignWithDetails, 'Vibe Fund Campaign created successfully', 201);
  } catch (error) {
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
    sendPaginated(res, campaignsWithDetails, pagination, 'Vibe Fund Campaigns retrieved successfully');
  } catch (error) {
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
    sendSuccess(res, campaignWithDetails, 'Vibe Fund Campaign retrieved successfully');
  } catch (error) {
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
    sendSuccess(res, campaignWithDetails, 'Vibe Fund Campaign updated successfully');
  } catch (error) {
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
    sendSuccess(res, campaign, 'Vibe Fund Campaign deleted successfully');
  } catch (error) {
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
    sendPaginated(res, campaignsWithDetails, pagination, 'User vibe fund campaigns retrieved successfully');
  } catch (error) {
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
    sendSuccess(res, campaignWithDetails, `Campaign ${approved_status ? 'approved' : 'rejected'} successfully`);
  } catch (error) {
    throw error;
  }
});

/**
 * Get Vibe Fund statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVibeFound = asyncHandler(async (req, res) => {
  try {
    // Active campaigns count (status=true and approved_status=true)
    const ActiveCompaignsCount = await VibeFundCampaign.countDocuments({
      status: true,
      approved_status: true
    });

    // Total raised (sum of fund_amount from VibeFundingCampaign where status=true)
    const totalRaisedResult = await VibeFundingCampaign.aggregate([
      {
        $match: { status: true }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$fund_amount' }
        }
      }
    ]);
    const TotalRaised = totalRaisedResult.length > 0 ? totalRaisedResult[0].total : 0;

    // Total campaigns count
    const TotalCampaigns = await VibeFundCampaign.countDocuments({});

    // Average funding (average of funding_goal from all campaigns)
    const avgFundingResult = await VibeFundCampaign.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: '$funding_goal' }
        }
      }
    ]);
    const Avg_Funding = avgFundingResult.length > 0 ? Math.round(avgFundingResult[0].avg * 100) / 100 : 0;

    // Inactive campaigns count (status=false)
    const InActiveCompaigns = await VibeFundCampaign.countDocuments({
      status: false
    });

    const statistics = {
      ActiveCompaignsCount,
      TotalRaised,
      TotalCampaigns,
      Avg_Funding,
      InActiveCompaigns
    };

    sendSuccess(res, statistics, 'Vibe Fund statistics retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get Disbursements
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDisbursements = asyncHandler(async (req, res) => {
  try {
    // Get all disbursements
    const disbursements = await Disbursement.find({})
      .sort({ request_date: -1 });

    // Get unique IDs for population
    const campaignIds = [...new Set(disbursements.map(d => d.vibe_fund_campaign_id).filter(Boolean))];
    const userIds = [...new Set(disbursements.map(d => d.beneficiary_user_id).filter(Boolean))];
    const bankIds = [...new Set(disbursements.map(d => d.bank_name_id).filter(Boolean))];

    // Fetch related data
    const [campaigns, users, banks] = await Promise.all([
      VibeFundCampaign.find({ vibe_fund_campaign_id: { $in: campaignIds } })
        .select('vibe_fund_campaign_id title'),
      User.find({ user_id: { $in: userIds } })
        .select('user_id name'),
      BankName.find({ bank_name_id: { $in: bankIds } })
        .select('bank_name_id bank_name')
    ]);

    // Create maps for quick lookup
    const campaignMap = {};
    campaigns.forEach(campaign => {
      campaignMap[campaign.vibe_fund_campaign_id] = campaign;
    });

    const userMap = {};
    users.forEach(user => {
      userMap[user.user_id] = user;
    });

    const bankMap = {};
    banks.forEach(bank => {
      bankMap[bank.bank_name_id] = bank;
    });

    // Format disbursements data
    const now = new Date();
    const disbursementsData = disbursements.map(disbursement => {
      const campaign = campaignMap[disbursement.vibe_fund_campaign_id];
      const beneficiary = userMap[disbursement.beneficiary_user_id];
      const bank = bankMap[disbursement.bank_name_id];

      // Calculate age in hours
      const requestDate = new Date(disbursement.request_date);
      const diffMs = now - requestDate;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      return {
        ReqId: disbursement.disbursement_id,
        CampaignName: campaign ? campaign.title : 'N/A',
        Beneficiary: beneficiary ? beneficiary.name : 'N/A',
        Amount: disbursement.amount,
        Bank: bank ? bank.bank_name : 'N/A',
        Age_Hour: diffHours,
        datetime: disbursement.request_date.toISOString()
      };
    });

    sendSuccess(res, disbursementsData, 'Disbursements retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get Campaigns (Funding contributions with campaign details)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCampaigns = asyncHandler(async (req, res) => {
  try {
    // Get all funding contributions
    const fundings = await VibeFundingCampaign.find({})
      .sort({ created_at: -1 });

    // Get unique IDs for population
    const campaignIds = [...new Set(fundings.map(f => f.vibe_fund_campaign_id).filter(Boolean))];
    const userIds = [...new Set(fundings.map(f => f.fundby_user_id).filter(Boolean))];

    // Fetch related data
    const [campaigns, users] = await Promise.all([
      VibeFundCampaign.find({ vibe_fund_campaign_id: { $in: campaignIds } })
        .select('vibe_fund_campaign_id title funding_goal status approved_status'),
      User.find({ user_id: { $in: userIds } })
        .select('user_id name')
    ]);

    // Create maps for quick lookup
    const campaignMap = {};
    campaigns.forEach(campaign => {
      campaignMap[campaign.vibe_fund_campaign_id] = campaign;
    });

    const userMap = {};
    users.forEach(user => {
      userMap[user.user_id] = user;
    });

    // Format campaigns data
    const campaignsData = fundings.map(funding => {
      const campaign = campaignMap[funding.vibe_fund_campaign_id];
      const funder = userMap[funding.fundby_user_id];

      // Determine status - use campaign status if available, otherwise funding status
      let status = 'Active';
      if (campaign) {
        if (!campaign.status) {
          status = 'Inactive';
        } else if (!campaign.approved_status) {
          status = 'Pending Approval';
        } else {
          status = 'Active';
        }
      } else if (!funding.status) {
        status = 'Inactive';
      }

      return {
        Date: funding.created_at.toISOString(),
        Campaign: campaign ? campaign.title : 'N/A',
        Funder: funder ? funder.name : 'N/A',
        Amount: funding.fund_amount,
        Goal: campaign ? campaign.funding_goal : 0,
        Status: status
      };
    });

    sendSuccess(res, campaignsData, 'Campaigns retrieved successfully');
  } catch (error) {
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
  changeApprovedStatus,
  getVibeFound,
  getDisbursements,
  getCampaigns
};

