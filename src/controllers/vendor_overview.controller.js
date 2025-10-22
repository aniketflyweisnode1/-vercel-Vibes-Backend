const VendorLeads = require('../models/vendor_leads.model');
const LeadDiscovered = require('../models/lead_discovered.model');
const LeadContacted = require('../models/lead_contacted.model');
const OnboardingStarted = require('../models/onboarding_started.model');
const Featured = require('../models/featured.model');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Get vendor leads overview with statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVendorLeadsOverview = asyncHandler(async (req, res) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Get total leads from last month
    const totalLeadsLastMonth = await VendorLeads.countDocuments({
      created_at: { $gte: oneMonthAgo },
      Status: true
    });

    // Get active leads (LeadStatus = 'Active')
    const activeLeads = await VendorLeads.countDocuments({
      LeadStatus: 'Active',
      Status: true
    });

    // Get conversion rate (leads that have been converted)
    const totalLeads = await VendorLeads.countDocuments({ Status: true });
    const convertedLeads = await VendorLeads.countDocuments({
      Status: true,
      // Assuming we track conversion through related models
      // This would need to be adjusted based on your business logic
    });

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Calculate average time to convert (this is a simplified calculation)
    // You might need to adjust this based on your specific business logic
    const avgTimeToConvert = 0; // This would need to be calculated based on your conversion tracking

    const overview = {
      totalLeadsLastMonth,
      activeLeads,
      conversionRate: Math.round(conversionRate * 100) / 100, // Round to 2 decimal places
      avgTimeToConvert
    };

    sendSuccess(res, overview, 'Vendor leads overview retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get pipeline overview for all lead stages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPipelineOverview = asyncHandler(async (req, res) => {
  try {
    // Get Lead Discovered stats
    const leadDiscoveredStats = await LeadDiscovered.aggregate([
      { $match: { Status: true } },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          convertedCount: { $sum: { $cond: ['$covert', 1, 0] } },
          totalEstimatedValue: { $sum: '$EstimetedValuePrice' }
        }
      }
    ]);

    // Get Lead Contacted stats
    const leadContactedStats = await LeadContacted.aggregate([
      { $match: { Status: true } },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          convertedCount: { $sum: { $cond: ['$covert', 1, 0] } },
          totalEstimatedValue: { $sum: '$EstimetedValuePrice' }
        }
      }
    ]);

    // Get Onboarding Started stats
    const onboardingStartedStats = await OnboardingStarted.aggregate([
      { $match: { Status: true } },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          convertedCount: { $sum: { $cond: ['$covert', 1, 0] } },
          totalEstimatedValue: { $sum: '$EstimetedValuePrice' }
        }
      }
    ]);

    // Get Activated Leads stats (from Vendor_Leads with status = true)
    const activatedLeadsStats = await VendorLeads.aggregate([
      { $match: { Status: true } },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalEstimatedValue: { $sum: '$EstimetedValuePrice' }
        }
      }
    ]);

    // Get Featured stats
    const featuredStats = await Featured.aggregate([
      { $match: { Status: true } },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          convertedCount: { $sum: { $cond: ['$covert', 1, 0] } },
          totalEstimatedValue: { $sum: '$EstimetedValuePrice' }
        }
      }
    ]);

    const pipelineOverview = {
      leadDiscovered: {
        totalCount: leadDiscoveredStats[0]?.totalCount || 0,
        conversionRate: leadDiscoveredStats[0]?.totalCount > 0 
          ? Math.round((leadDiscoveredStats[0].convertedCount / leadDiscoveredStats[0].totalCount) * 100 * 100) / 100 
          : 0,
        totalEstimatedValue: leadDiscoveredStats[0]?.totalEstimatedValue || 0
      },
      leadContacted: {
        totalCount: leadContactedStats[0]?.totalCount || 0,
        conversionRate: leadContactedStats[0]?.totalCount > 0 
          ? Math.round((leadContactedStats[0].convertedCount / leadContactedStats[0].totalCount) * 100 * 100) / 100 
          : 0,
        totalEstimatedValue: leadContactedStats[0]?.totalEstimatedValue || 0
      },
      onboardingStarted: {
        totalCount: onboardingStartedStats[0]?.totalCount || 0,
        conversionRate: onboardingStartedStats[0]?.totalCount > 0 
          ? Math.round((onboardingStartedStats[0].convertedCount / onboardingStartedStats[0].totalCount) * 100 * 100) / 100 
          : 0,
        totalEstimatedValue: onboardingStartedStats[0]?.totalEstimatedValue || 0
      },
      activatedLeads: {
        totalCount: activatedLeadsStats[0]?.totalCount || 0,
        totalEstimatedValue: activatedLeadsStats[0]?.totalEstimatedValue || 0
      },
      featured: {
        totalCount: featuredStats[0]?.totalCount || 0,
        conversionRate: featuredStats[0]?.totalCount > 0 
          ? Math.round((featuredStats[0].convertedCount / featuredStats[0].totalCount) * 100 * 100) / 100 
          : 0,
        totalEstimatedValue: featuredStats[0]?.totalEstimatedValue || 0
      }
    };

    sendSuccess(res, pipelineOverview, 'Pipeline overview retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get recent outreach activities (last 2 leads)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRecentOutreachActivities = asyncHandler(async (req, res) => {
  try {
    // Get the 2 most recent vendor leads
    const recentLeads = await VendorLeads.find({ Status: true })
      .sort({ created_at: -1 })
      .limit(2)
      .select('Vendor_Leads_id Vendor_name ContactEmail EstimetedValuePrice created_at LeadStatus');

    sendSuccess(res, recentLeads, 'Recent outreach activities retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get upcoming follow-ups (vendors requiring attention in the next 7 days)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUpcomingFollowUps = asyncHandler(async (req, res) => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Get leads that need follow-up in the next 7 days
    // This is a simplified implementation - you might need to adjust based on your business logic
    const upcomingFollowUps = await VendorLeads.find({
      Status: true,
      LeadStatus: 'Active',
      // Add your follow-up logic here
      // For example, if you have a follow_up_date field:
      // follow_up_date: { $lte: sevenDaysFromNow, $gte: new Date() }
    })
    .sort({ created_at: 1 })
    .select('Vendor_Leads_id Vendor_name ContactEmail EstimetedValuePrice created_at LeadStatus');

    sendSuccess(res, upcomingFollowUps, 'Upcoming follow-ups retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  getVendorLeadsOverview,
  getPipelineOverview,
  getRecentOutreachActivities,
  getUpcomingFollowUps
};
