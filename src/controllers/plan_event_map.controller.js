const PlanEventMap = require('../models/plan_event_map.model');
const Transaction = require('../models/transaction.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Helper function to populate all IDs in plan event map
 */
const populatePlanEventMap = async (planEventMap) => {
  if (!planEventMap) return planEventMap;

  const planObj = planEventMap.toObject ? planEventMap.toObject() : planEventMap;

  // Populate event_id
  if (planObj.event_id) {
    try {
      const Event = require('../models/event.model');
      const event = await Event.findOne({ event_id: planObj.event_id });
      planObj.event_details = event || null;
    } catch (error) {
      console.log('Event not found for ID:', planObj.event_id);
      planObj.event_details = null;
    }
  }

  // Populate menu_drinks
  if (planObj.menu_drinks && Array.isArray(planObj.menu_drinks) && planObj.menu_drinks.length > 0) {
    try {
      const Drinks = require('../models/drinks.model');
      const drinks = await Drinks.find({ drinks_id: { $in: planObj.menu_drinks } });
      planObj.menu_drinks_details = drinks || [];
    } catch (error) {
      console.log('Error populating menu_drinks:', error);
      planObj.menu_drinks_details = [];
    }
  } else {
    planObj.menu_drinks_details = [];
  }

  // Populate menu_food
  if (planObj.menu_food && Array.isArray(planObj.menu_food) && planObj.menu_food.length > 0) {
    try {
      const Food = require('../models/food.model');
      const food = await Food.find({ food_id: { $in: planObj.menu_food } });
      planObj.menu_food_details = food || [];
    } catch (error) {
      console.log('Error populating menu_food:', error);
      planObj.menu_food_details = [];
    }
  } else {
    planObj.menu_food_details = [];
  }

  // Populate menu_entertainment
  if (planObj.menu_entertainment && Array.isArray(planObj.menu_entertainment) && planObj.menu_entertainment.length > 0) {
    try {
      const Entertainment = require('../models/entertainment.model');
      const entertainment = await Entertainment.find({ entertainment_id: { $in: planObj.menu_entertainment } });
      planObj.menu_entertainment_details = entertainment || [];
    } catch (error) {
      console.log('Error populating menu_entertainment:', error);
      planObj.menu_entertainment_details = [];
    }
  } else {
    planObj.menu_entertainment_details = [];
  }

  // Populate menu_decorations
  if (planObj.menu_decorations && Array.isArray(planObj.menu_decorations) && planObj.menu_decorations.length > 0) {
    try {
      const Decorations = require('../models/decorations.model');
      const decorations = await Decorations.find({ decorations_id: { $in: planObj.menu_decorations } });
      planObj.menu_decorations_details = decorations || [];
    } catch (error) {
      console.log('Error populating menu_decorations:', error);
      planObj.menu_decorations_details = [];
    }
  } else {
    planObj.menu_decorations_details = [];
  }

  // Populate tasks
  if (planObj.tasks && Array.isArray(planObj.tasks) && planObj.tasks.length > 0) {
    try {
      const EventTasks = require('../models/event_tasks.model');
      const tasks = await EventTasks.find({ event_tasks_id: { $in: planObj.tasks } });
      planObj.tasks_details = tasks || [];
    } catch (error) {
      console.log('Error populating tasks:', error);
      planObj.tasks_details = [];
    }
  } else {
    planObj.tasks_details = [];
  }

  // Populate chat
  if (planObj.chat && Array.isArray(planObj.chat) && planObj.chat.length > 0) {
    try {
      const EventDiscussionChat = require('../models/event_discussion_chat.model');
      const chats = await EventDiscussionChat.find({ event_discussion_chat_id: { $in: planObj.chat } });
      planObj.chat_details = chats || [];
    } catch (error) {
      console.log('Error populating chat:', error);
      planObj.chat_details = [];
    }
  } else {
    planObj.chat_details = [];
  }

  // Populate budget_items_id
  if (planObj.budget_items_id && Array.isArray(planObj.budget_items_id) && planObj.budget_items_id.length > 0) {
    try {
      const BudgetItems = require('../models/budget_items.model');
      const budgetItems = await BudgetItems.find({ budget_items_id: { $in: planObj.budget_items_id } });
      planObj.budget_items_details = budgetItems || [];
    } catch (error) {
      console.log('Error populating budget_items_id:', error);
      planObj.budget_items_details = [];
    }
  } else {
    planObj.budget_items_details = [];
  }

  // Populate venue_management
  if (planObj.venue_management) {
    // Populate venue_details
    if (planObj.venue_management.venue_details) {
      try {
        const VenueDetails = require('../models/venue_details.model');
        const venueDetails = await VenueDetails.findOne({ venue_details_id: planObj.venue_management.venue_details });
        planObj.venue_management.venue_details_details = venueDetails || null;
      } catch (error) {
        console.log('Error populating venue_details:', error);
        planObj.venue_management.venue_details_details = null;
      }
    }

    // Populate amenities_id
    if (planObj.venue_management.amenities_id && Array.isArray(planObj.venue_management.amenities_id) && planObj.venue_management.amenities_id.length > 0) {
      try {
        const EventAmenities = require('../models/event_amenities.model');
        const amenities = await EventAmenities.find({ event_amenities_id: { $in: planObj.venue_management.amenities_id } });
        planObj.venue_management.amenities_details = amenities || [];
      } catch (error) {
        console.log('Error populating amenities_id:', error);
        planObj.venue_management.amenities_details = [];
      }
    } else {
      planObj.venue_management.amenities_details = [];
    }

    // Populate setup_requirements
    if (planObj.venue_management.setup_requirements && Array.isArray(planObj.venue_management.setup_requirements) && planObj.venue_management.setup_requirements.length > 0) {
      try {
        const EventSetupRequirements = require('../models/event_setup_requirements.model');
        const setupRequirementsDetails = await Promise.all(
          planObj.venue_management.setup_requirements.map(async (req) => {
            if (req.setup_requirements_id) {
              const setupReq = await EventSetupRequirements.findOne({ event_setup_requirements_id: req.setup_requirements_id });
              return {
                ...req,
                setup_requirements_details: setupReq || null
              };
            }
            return req;
          })
        );
        planObj.venue_management.setup_requirements_details = setupRequirementsDetails;
      } catch (error) {
        console.log('Error populating setup_requirements:', error);
        planObj.venue_management.setup_requirements_details = planObj.venue_management.setup_requirements;
      }
    } else {
      planObj.venue_management.setup_requirements_details = [];
    }
  }

  // Populate event_gallery
  if (planObj.event_gallery && Array.isArray(planObj.event_gallery) && planObj.event_gallery.length > 0) {
    try {
      const EventGallery = require('../models/event_gallery.model');
      const gallery = await EventGallery.find({ event_gallery_id: { $in: planObj.event_gallery } });
      planObj.event_gallery_details = gallery || [];
    } catch (error) {
      console.log('Error populating event_gallery:', error);
      planObj.event_gallery_details = [];
    }
  } else {
    planObj.event_gallery_details = [];
  }

  // Populate guests_id
  if (planObj.guests_id && Array.isArray(planObj.guests_id) && planObj.guests_id.length > 0) {
    try {
      const Guest = require('../models/guest.model');
      const guestsDetails = await Promise.all(
        planObj.guests_id.map(async (guestItem) => {
          if (guestItem.guest_id) {
            const guest = await Guest.findOne({ guest_id: guestItem.guest_id });
            return {
              ...guestItem,
              guest_details: guest || null
            };
          }
          return guestItem;
        })
      );
      planObj.guests_details = guestsDetails;
    } catch (error) {
      console.log('Error populating guests_id:', error);
      planObj.guests_details = planObj.guests_id;
    }
  } else {
    planObj.guests_details = [];
  }

  // Populate transaction_id
  if (planObj.transaction_id) {
    try {
      const transaction = await Transaction.findOne({ transaction_id: planObj.transaction_id });
      planObj.transaction_details = transaction || null;
    } catch (error) {
      console.log('Transaction not found for ID:', planObj.transaction_id);
      planObj.transaction_details = null;
    }
  }

  // Populate createdBy
  if (planObj.createdBy) {
    try {
      const User = require('../models/user.model');
      const createdByUser = await User.findOne({ user_id: planObj.createdBy });
      planObj.created_by_details = createdByUser ? {
        user_id: createdByUser.user_id,
        name: createdByUser.name,
        email: createdByUser.email,
        mobile: createdByUser.mobile
      } : null;
    } catch (error) {
      console.log('User not found for createdBy ID:', planObj.createdBy);
      planObj.created_by_details = null;
    }
  }

  // Populate updatedBy
  if (planObj.updatedBy) {
    try {
      const User = require('../models/user.model');
      const updatedByUser = await User.findOne({ user_id: planObj.updatedBy });
      planObj.updated_by_details = updatedByUser ? {
        user_id: updatedByUser.user_id,
        name: updatedByUser.name,
        email: updatedByUser.email,
        mobile: updatedByUser.mobile
      } : null;
    } catch (error) {
      console.log('User not found for updatedBy ID:', planObj.updatedBy);
      planObj.updated_by_details = null;
    }
  }

  return planObj;
};

/**
 * Create a new plan event map
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPlanEventMap = asyncHandler(async (req, res) => {
  try {
    // Create transaction first
    const transactionData = {
      user_id: req.userId,
      amount: req.body.amount || 0, // Amount from request body or default to 0
      payment_method_id: req.body.payment_method_id || 1, // Default payment method
      transactionType: 'EventPayment',
      created_by: req.userId
    };

    const transaction = await Transaction.create(transactionData);

    // Create plan event map data with the transaction ID
    const planEventMapData = {
      ...req.body,
      transaction_id: transaction.transaction_id,
      createdBy: req.userId
    };

    // Create plan event map
    const planEventMap = await PlanEventMap.create(planEventMapData);

    // Return both plan event map and transaction info
    const responseData = {
      planEventMap,
      transaction: {
        transaction_id: transaction.transaction_id,
        amount: transaction.amount,
        status: transaction.status,
        transactionType: transaction.transactionType
      }
    };

    sendSuccess(res, responseData, 'Plan event map and transaction created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all plan event maps with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllPlanEventMaps = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, event_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
  
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }

    // Get plan event maps with pagination
    const [planEventMaps, total] = await Promise.all([
      PlanEventMap.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PlanEventMap.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, planEventMaps, pagination, 'Plan event maps retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get plan event map by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPlanEventMapById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const planEventMap = await PlanEventMap.findOne({ plan_event_id: parseInt(id) });

    if (!planEventMap) {
      return sendNotFound(res, 'Plan event map not found');
    }

    sendSuccess(res, planEventMap, 'Plan event map retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get plan event maps by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPlanEventMapsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, event_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { createdBy: req.userId };
  
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }

    // Get plan event maps with pagination
    const [planEventMaps, total] = await Promise.all([
      PlanEventMap.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PlanEventMap.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, planEventMaps, pagination, 'User plan event maps retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get plan event maps by event ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPlanEventMapsByEventId = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { event_id: parseInt(eventId) };
  
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Get plan event maps with pagination
    const [planEventMaps, total] = await Promise.all([
      PlanEventMap.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PlanEventMap.countDocuments(filter)
    ]);

    // Populate all IDs for each plan event map
    const populatedPlanEventMaps = await Promise.all(
      planEventMaps.map(planEventMap => populatePlanEventMap(planEventMap))
    );

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, populatedPlanEventMaps, pagination, 'Plan event maps by event retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update plan event map
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePlanEventMap = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    const planEventMap = await PlanEventMap.findOneAndUpdate(
      { plan_event_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!planEventMap) {
      return sendNotFound(res, 'Plan event map not found');
    }

    sendSuccess(res, planEventMap, 'Plan event map updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update event payment status after transaction completion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEventPayment = asyncHandler(async (req, res) => {
  try {
    const { transaction_id } = req.body;

// payment status get status from transaction

    // Find the transaction
    const transaction = await Transaction.findOne({ transaction_id: parseInt(transaction_id) });
    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }


    // Find the plan event map by transaction_id
    const planEventMap = await PlanEventMap.findOne({ transaction_id: transaction_id });
    if (!planEventMap) {
      return sendNotFound(res, 'Plan event map not found for this transaction');
    }

    // Prepare update data
    const updateData = {
      payment_status: transaction.status === 'completed' ? 'completed' : 
                     transaction.status === 'failed' ? 'failed' : 
                     transaction.status === 'refunded' ? 'refunded' : 'pending',
      updatedBy: req.userId,
      updatedAt: new Date()
    };

    // Update the plan event map
    const updatedPlanEventMap = await PlanEventMap.findOneAndUpdate(
      { plan_event_id: planEventMap.plan_event_id },
      updateData,
      { new: true, runValidators: true }
    );

    sendSuccess(res, updatedPlanEventMap, 'Event payment status updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete plan event map
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deletePlanEventMap = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const planEventMap = await PlanEventMap.findOneAndDelete({ plan_event_id: parseInt(id) });

    if (!planEventMap) {
      return sendNotFound(res, 'Plan event map not found');
    }

    sendSuccess(res, null, 'Plan event map deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createPlanEventMap,
  getAllPlanEventMaps,
  getPlanEventMapById,
  getPlanEventMapsByAuth,
  getPlanEventMapsByEventId,
  updatePlanEventMap,
  updateEventPayment,
  deletePlanEventMap
};
