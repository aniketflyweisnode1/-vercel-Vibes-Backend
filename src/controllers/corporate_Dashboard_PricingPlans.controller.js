const CorporateDashboardPricingPlans = require('../models/corporate_Dashboard_PricingPlans.model');
const User = require('../models/user.model');
const PaymentMethods = require('../models/payment_methods.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Helper function to populate related data
 */
const populateCorporateDashboardPricingPlans = async (pricingPlan) => {
  const populatedData = { ...pricingPlan.toObject() };
  
  // Populate CreateBy and UpdatedBy
  if (pricingPlan.CreateBy) {
    const createdByUser = await User.findOne({ user_id: pricingPlan.CreateBy });
    populatedData.created_by_details = createdByUser ? {
      user_id: createdByUser.user_id,
      name: createdByUser.name,
      email: createdByUser.email
    } : null;
  }

  if (pricingPlan.UpdatedBy) {
    const updatedByUser = await User.findOne({ user_id: pricingPlan.UpdatedBy });
    populatedData.updated_by_details = updatedByUser ? {
      user_id: updatedByUser.user_id,
      name: updatedByUser.name,
      email: updatedByUser.email
    } : null;
  }

  // Populate Payment Methods
  if (pricingPlan.PaymentMethods && pricingPlan.PaymentMethods.length > 0) {
    const paymentMethods = await PaymentMethods.find({ 
      payment_methods_id: { $in: pricingPlan.PaymentMethods } 
    });
    populatedData.payment_methods_details = paymentMethods.map(pm => ({
      payment_methods_id: pm.payment_methods_id,
      payment_method: pm.payment_method,
      emoji: pm.emoji,
      status: pm.status
    }));
  }

  return populatedData;
};

/**
 * Create a new corporate dashboard pricing plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCorporateDashboardPricingPlans = asyncHandler(async (req, res) => {
  try {
    const pricingPlanData = {
      ...req.body,
      CreateBy: req.userId,
      CreateAt: new Date()
    };

    const pricingPlan = await CorporateDashboardPricingPlans.create(pricingPlanData);
    const populatedPricingPlan = await populateCorporateDashboardPricingPlans(pricingPlan);

    sendSuccess(res, populatedPricingPlan, 'Corporate dashboard pricing plan created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all corporate dashboard pricing plans with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCorporateDashboardPricingPlans = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      MinBookingFee,
      PriceRangeMin,
      PriceRangeMax,
      isDeposit,
      Status
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { MinBookingFee: { $regex: search, $options: 'i' } },
        { PriceRangeMin: { $regex: search, $options: 'i' } },
        { PriceRangeMax: { $regex: search, $options: 'i' } }
      ];
    }

    // Add MinBookingFee filter
    if (MinBookingFee) {
      filter.MinBookingFee = { $gte: parseFloat(MinBookingFee) };
    }

    // Add PriceRangeMin filter
    if (PriceRangeMin) {
      filter.PriceRangeMin = { $gte: parseFloat(PriceRangeMin) };
    }

    // Add PriceRangeMax filter
    if (PriceRangeMax) {
      filter.PriceRangeMax = { $lte: parseFloat(PriceRangeMax) };
    }

    // Add isDeposit filter
    if (isDeposit !== undefined) {
      filter.isDeposit = isDeposit === 'true';
    }

    // Add Status filter
    if (Status !== undefined) {
      filter.Status = Status === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await CorporateDashboardPricingPlans.countDocuments(filter);

    // Get pricing plans with pagination
    const pricingPlans = await CorporateDashboardPricingPlans.find(filter)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Populate related data
    const populatedPricingPlans = await Promise.all(
      pricingPlans.map(pricingPlan => populateCorporateDashboardPricingPlans(pricingPlan))
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

    sendPaginated(res, populatedPricingPlans, 'Corporate dashboard pricing plans retrieved successfully', paginationInfo);
  } catch (error) {
    throw error;
  }
});

/**
 * Get corporate dashboard pricing plan by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCorporateDashboardPricingPlansById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const pricingPlan = await CorporateDashboardPricingPlans.findOne({ PricingPlans_id: parseInt(id) });

    if (!pricingPlan) {
      return sendNotFound(res, 'Corporate dashboard pricing plan not found');
    }

    const populatedPricingPlan = await populateCorporateDashboardPricingPlans(pricingPlan);
    sendSuccess(res, populatedPricingPlan, 'Corporate dashboard pricing plan retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update corporate dashboard pricing plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCorporateDashboardPricingPlans = asyncHandler(async (req, res) => {
  try {
    const { PricingPlans_id } = req.body;

    const pricingPlan = await CorporateDashboardPricingPlans.findOne({ PricingPlans_id: parseInt(PricingPlans_id) });

    if (!pricingPlan) {
      return sendNotFound(res, 'Corporate dashboard pricing plan not found');
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      UpdatedBy: req.userId,
      UpdatedAt: new Date()
    };

    // Remove ID from update data to avoid updating it
    delete updateData.PricingPlans_id;

    const updatedPricingPlan = await CorporateDashboardPricingPlans.findOneAndUpdate(
      { PricingPlans_id: parseInt(PricingPlans_id) },
      updateData,
      { new: true, runValidators: true }
    );

    const populatedPricingPlan = await populateCorporateDashboardPricingPlans(updatedPricingPlan);
    sendSuccess(res, populatedPricingPlan, 'Corporate dashboard pricing plan updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete corporate dashboard pricing plan (soft delete by setting Status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCorporateDashboardPricingPlans = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const pricingPlan = await CorporateDashboardPricingPlans.findOne({ PricingPlans_id: parseInt(id) });

    if (!pricingPlan) {
      return sendNotFound(res, 'Corporate dashboard pricing plan not found');
    }

    // Soft delete by setting Status to false
    const deletedPricingPlan = await CorporateDashboardPricingPlans.findOneAndUpdate(
      { PricingPlans_id: parseInt(id) },
      {
        Status: false,
        UpdatedBy: req.userId,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    sendSuccess(res, deletedPricingPlan, 'Corporate dashboard pricing plan deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createCorporateDashboardPricingPlans,
  getAllCorporateDashboardPricingPlans,
  getCorporateDashboardPricingPlansById,
  updateCorporateDashboardPricingPlans,
  deleteCorporateDashboardPricingPlans
};
