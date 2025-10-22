const OnboardingStarted = require('../models/onboarding_started.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new onboarding started
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createOnboardingStarted = asyncHandler(async (req, res) => {
  try {
    // Create onboarding started data
    const onboardingData = {
      ...req.body,
      created_by: req.userId
    };

    // Create onboarding started
    const onboarding = await OnboardingStarted.create(onboardingData);
    sendSuccess(res, onboarding, 'Onboarding started created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all onboarding started with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllOnboardingStarted = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      covert,
      Status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { Vendor_Leads_id: { $regex: search, $options: 'i' } },
        { user_id: { $regex: search, $options: 'i' } }
      ];
    }

    // Add covert filter
    if (covert !== undefined) {
      filter.covert = covert === 'true';
    }

    // Add Status filter
    if (Status !== undefined) {
      filter.Status = Status === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [onboardings, total] = await Promise.all([
      OnboardingStarted.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      OnboardingStarted.countDocuments(filter)
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
    sendPaginated(res, onboardings, pagination, 'Onboarding started retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get onboarding started by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getOnboardingStartedById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const onboarding = await OnboardingStarted.findOne({ 
      Onboarding_Started_id: parseInt(id) 
    });

    if (!onboarding) {
      return sendNotFound(res, 'Onboarding started not found');
    }
    sendSuccess(res, onboarding, 'Onboarding started retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update onboarding started by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateOnboardingStarted = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const onboarding = await OnboardingStarted.findOneAndUpdate(
      { Onboarding_Started_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!onboarding) {
      return sendNotFound(res, 'Onboarding started not found');
    }
    sendSuccess(res, onboarding, 'Onboarding started updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update onboarding started by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateOnboardingStartedByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const onboarding = await OnboardingStarted.findOneAndUpdate(
      { Onboarding_Started_id: parseInt(id) },
      finalUpdateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!onboarding) {
      return sendNotFound(res, 'Onboarding started not found');
    }
    sendSuccess(res, onboarding, 'Onboarding started updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete onboarding started by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteOnboardingStarted = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const onboarding = await OnboardingStarted.findOneAndUpdate(
      { Onboarding_Started_id: parseInt(id) },
      { 
        Status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!onboarding) {
      return sendNotFound(res, 'Onboarding started not found');
    }
    sendSuccess(res, onboarding, 'Onboarding started deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createOnboardingStarted,
  getAllOnboardingStarted,
  getOnboardingStartedById,
  updateOnboardingStarted,
  updateOnboardingStartedByIdBody,
  deleteOnboardingStarted
};
