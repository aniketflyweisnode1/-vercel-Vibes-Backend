const CorporateDashboardClient = require('../models/corporate_Dashboard_Client.model');
const CorporateDashboardPricingPlans = require('../models/corporate_Dashboard_PricingPlans.model');
const Event = require('../models/event.model');
const Transaction = require('../models/transaction.model');
const MarketPlaceBooking = require('../models/marketplace_booking.model');
const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Get corporate dashboard analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCorporateDashboard = asyncHandler(async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999);

    // Get total clients
    const totalClients = await CorporateDashboardClient.find({ Status: true });
    
    // Get monthly revenue from completed transactions
    const monthlyRevenue = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          transaction_date: {
            $gte: startOfMonth,
            $lte: endOfMonth
          },
          transactionType: {
            $in: ['EventPayment', 'TicketBooking', 'StaffBooking', 'CateringBooking', 'Package_Buy']
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    // Get events this month
    const eventsThisMonth = await Event.find({
      Status: true,
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    });

    // Get last month's revenue for growth rate calculation
    const lastMonthRevenue = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          transaction_date: {
            $gte: startOfLastMonth,
            $lte: endOfLastMonth
          },
          transactionType: {
            $in: ['EventPayment', 'TicketBooking', 'StaffBooking', 'CateringBooking', 'Package_Buy']
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    // Calculate growth rate
    const currentRevenue = monthlyRevenue.length > 0 ? monthlyRevenue[0].totalRevenue : 0;
    const previousRevenue = lastMonthRevenue.length > 0 ? lastMonthRevenue[0].totalRevenue : 0;
    
    let growthRate = 0;
    if (previousRevenue > 0) {
      growthRate = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    } else if (currentRevenue > 0) {
      growthRate = 100; // 100% growth if no previous revenue
    }

    // Get additional analytics
    const clientStats = await CorporateDashboardClient.aggregate([
      {
        $match: { Status: true }
      },
      {
        $group: {
          _id: '$industry',
          count: { $sum: 1 },
          avgEmployeeCount: { $avg: '$EmployeeCount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get pricing plans statistics
    const pricingPlansStats = await CorporateDashboardPricingPlans.aggregate([
      {
        $match: { Status: true }
      },
      {
        $group: {
          _id: null,
          totalPlans: { $sum: 1 },
          avgMinBookingFee: { $avg: '$MinBookingFee' },
          avgPriceRangeMin: { $avg: '$PriceRangeMin' },
          avgPriceRangeMax: { $avg: '$PriceRangeMax' }
        }
      }
    ]);

    // Get recent transactions for detailed revenue breakdown
    const recentTransactions = await Transaction.find({
      status: 'completed',
      transaction_date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      },
      transactionType: {
        $in: ['EventPayment', 'TicketBooking', 'StaffBooking', 'CateringBooking', 'Package_Buy']
      }
    })
    .sort({ transaction_date: -1 })
    .limit(10)
    .select('amount transactionType transaction_date user_id reference_number');

    // Calculate revenue by transaction type
    const revenueByType = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          transaction_date: {
            $gte: startOfMonth,
            $lte: endOfMonth
          },
          transactionType: {
            $in: ['EventPayment', 'TicketBooking', 'StaffBooking', 'CateringBooking', 'Package_Buy']
          }
        }
      },
      {
        $group: {
          _id: '$transactionType',
          totalRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    const dashboardData = {
      totalClients: totalClients.length,
      monthlyRevenue: currentRevenue,
      eventsThisMonth: eventsThisMonth.length,
      growthRate: Math.round(growthRate * 100) / 100, // Round to 2 decimal places
      clientStats: {
        byIndustry: clientStats,
        totalClients: totalClients.length
      },
      pricingPlansStats: pricingPlansStats.length > 0 ? pricingPlansStats[0] : {
        totalPlans: 0,
        avgMinBookingFee: 0,
        avgPriceRangeMin: 0,
        avgPriceRangeMax: 0
      },
      recentTransactions: recentTransactions,
      revenueByType: revenueByType,
      period: {
        currentMonth: {
          start: startOfMonth,
          end: endOfMonth
        },
        lastMonth: {
          start: startOfLastMonth,
          end: endOfLastMonth
        }
      }
    };

    sendSuccess(res, dashboardData, 'Corporate dashboard data retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get corporate dashboard clients with detailed analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCorporateDashboardClients = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      industry,
      Plan_id,
      Status
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { CompanyName: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { ContactEmail: { $regex: search, $options: 'i' } }
      ];
    }

    // Add industry filter
    if (industry) {
      filter.industry = { $regex: industry, $options: 'i' };
    }

    // Add Plan_id filter
    if (Plan_id) {
      filter.Plan_id = parseInt(Plan_id);
    }

    // Add Status filter
    if (Status !== undefined) {
      filter.Status = Status === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await CorporateDashboardClient.countDocuments(filter);

    // Get clients with pagination
    const clients = await CorporateDashboardClient.find(filter)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    const paginationInfo = {
      current_page: parseInt(page),
      total_pages: totalPages,
      total_items: total,
      items_per_page: parseInt(limit),
      has_next_page: hasNextPage,
      has_prev_page: hasPrevPage
    };

    const responseData = {
      clients: clients,
      pagination: paginationInfo
    };

    sendSuccess(res, responseData, 'Corporate dashboard clients retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  getCorporateDashboard,
  getCorporateDashboardClients
};
