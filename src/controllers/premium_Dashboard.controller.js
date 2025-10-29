const Event = require('../models/event.model');
const Guest = require('../models/guest.model');
const CorporateDashboardClient = require('../models/corporate_Dashboard_Client.model');
const PlanEventMap = require('../models/plan_event_map.model');
const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');
const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Get premium dashboard analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPremiumDashboard = asyncHandler(async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59, 999);

    // Get total events created by the authenticated user
    const totalEvents = await Event.find({ 
      created_by: req.userId,
      status: true 
    });

    // Get total guests from corporate dashboard clients
    const totalGuests = await CorporateDashboardClient.aggregate([
      {
        $match: { Status: true }
      },
      {
        $group: {
          _id: null,
          totalGuests: { $sum: '$EmployeeCount' }
        }
      }
    ]);

    // Calculate RSVP rate from plan_event_map
    const rsvpData = await PlanEventMap.aggregate([
      {
        $match: { status: true }
      },
      {
        $unwind: '$guests_id'
      },
      {
        $group: {
          _id: '$guests_id.invite_status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate average RSVP rate
    let avgRSVPRate = 0;
    if (rsvpData.length > 0) {
      const totalInvites = rsvpData.reduce((sum, item) => sum + item.count, 0);
      const confirmedInvites = rsvpData.find(item => item._id === 'Confirmed')?.count || 0;
      avgRSVPRate = totalInvites > 0 ? (confirmedInvites / totalInvites) * 100 : 0;
    }

    // Calculate revenue impact from events
    const revenueImpact = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          transactionType: {
            $in: ['EventPayment', 'TicketBooking', 'StaffBooking', 'CateringBooking']
          },
          transaction_date: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          avgTransactionValue: { $avg: '$amount' }
        }
      }
    ]);

    // Get event analytics by type
    const eventAnalytics = await Event.aggregate([
      {
        $match: { 
          created_by: req.userId,
          status: true 
        }
      },
      {
        $group: {
          _id: '$event_type_id',
          count: { $sum: 1 },
          avgCapacity: { $avg: '$max_capacity' },
          totalCapacity: { $sum: '$max_capacity' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get guest analytics by corporate clients
    const guestAnalytics = await CorporateDashboardClient.aggregate([
      {
        $match: { Status: true }
      },
      {
        $group: {
          _id: '$industry',
          clientCount: { $sum: 1 },
          totalEmployees: { $sum: '$EmployeeCount' },
          avgEmployees: { $avg: '$EmployeeCount' }
        }
      },
      {
        $sort: { totalEmployees: -1 }
      }
    ]);

    // Get premium themes data (mock data for now)
    const premiumThemes = [
      {
        theme_id: 1,
        name: 'Corporate Elegance',
        category: 'Business',
        usage_count: 15,
        revenue_generated: 2500
      },
      {
        theme_id: 2,
        name: 'Tech Innovation',
        category: 'Technology',
        usage_count: 12,
        revenue_generated: 3200
      },
      {
        theme_id: 3,
        name: 'Creative Arts',
        category: 'Creative',
        usage_count: 8,
        revenue_generated: 1800
      }
    ];

    // Get automation analytics
    const automationData = {
      automated_emails_sent: 1250,
      automated_reminders: 890,
      auto_rsvp_tracking: 95,
      automated_follow_ups: 340,
      time_saved_hours: 45
    };

    // Get export tools usage
    const exportTools = {
      guest_lists_exported: 25,
      event_reports_exported: 18,
      financial_reports_exported: 12,
      analytics_exports: 8,
      total_exports: 63
    };

    // Prepare reports data
    const reports = {
      analytics: {
        event_analytics: eventAnalytics,
        guest_analytics: guestAnalytics,
        rsvp_breakdown: rsvpData,
        revenue_breakdown: revenueImpact.length > 0 ? revenueImpact[0] : {
          totalRevenue: 0,
          transactionCount: 0,
          avgTransactionValue: 0
        }
      },
      premium_themes: premiumThemes,
      automation: automationData,
      export_tools: exportTools
    };

    // Calculate growth metrics
    const lastMonthEvents = await Event.countDocuments({
      created_by: req.userId,
      status: true,
      created_at: {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth
      }
    });

    const currentMonthEvents = totalEvents.length;
    const eventGrowthRate = lastMonthEvents > 0 ? 
      ((currentMonthEvents - lastMonthEvents) / lastMonthEvents) * 100 : 
      (currentMonthEvents > 0 ? 100 : 0);

    const premiumDashboardData = {
      total_events: totalEvents.length,
      total_guests: totalGuests.length > 0 ? totalGuests[0].totalGuests : 0,
      avg_rsvp_rate: Math.round(avgRSVPRate * 100) / 100,
      revenue_impact: revenueImpact.length > 0 ? revenueImpact[0] : {
        totalRevenue: 0,
        transactionCount: 0,
        avgTransactionValue: 0
      },
      growth_metrics: {
        event_growth_rate: Math.round(eventGrowthRate * 100) / 100,
        current_month_events: currentMonthEvents,
        last_month_events: lastMonthEvents
      },
      reports: reports,
      period: {
        current_month: {
          start: startOfMonth,
          end: endOfMonth
        },
        last_month: {
          start: startOfLastMonth,
          end: endOfLastMonth
        }
      }
    };

    sendSuccess(res, premiumDashboardData, 'Premium dashboard data retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get premium dashboard events with detailed analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPremiumDashboardEvents = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      event_type_id,
      date_from,
      date_to,
      status
    } = req.query;

    // Build filter object
    const filter = {
      created_by: req.userId
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { name_title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Add event type filter
    if (event_type_id) {
      filter.event_type_id = parseInt(event_type_id);
    }

    // Add date range filter
    if (date_from || date_to) {
      filter.date = {};
      if (date_from) {
        filter.date.$gte = new Date(date_from);
      }
      if (date_to) {
        filter.date.$lte = new Date(date_to);
      }
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await Event.countDocuments(filter);

    // Get events with pagination
    const events = await Event.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get RSVP data for each event
    const eventsWithRSVP = await Promise.all(
      events.map(async (event) => {
        const rsvpData = await PlanEventMap.aggregate([
          {
            $match: { 
              event_id: event.event_id,
              status: true 
            }
          },
          {
            $unwind: '$guests_id'
          },
          {
            $group: {
              _id: '$guests_id.invite_status',
              count: { $sum: 1 }
            }
          }
        ]);

        const totalInvites = rsvpData.reduce((sum, item) => sum + item.count, 0);
        const confirmedInvites = rsvpData.find(item => item._id === 'Confirmed')?.count || 0;
        const rsvpRate = totalInvites > 0 ? (confirmedInvites / totalInvites) * 100 : 0;

        return {
          ...event.toObject(),
          rsvp_data: {
            total_invites: totalInvites,
            confirmed_invites: confirmedInvites,
            rsvp_rate: Math.round(rsvpRate * 100) / 100,
            breakdown: rsvpData
          }
        };
      })
    );

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
      events: eventsWithRSVP,
      pagination: paginationInfo
    };

    sendSuccess(res, responseData, 'Premium dashboard events retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  getPremiumDashboard,
  getPremiumDashboardEvents
};
