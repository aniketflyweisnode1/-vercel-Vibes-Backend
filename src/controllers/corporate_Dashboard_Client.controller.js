const CorporateDashboardClient = require('../models/corporate_Dashboard_Client.model');
const User = require('../models/user.model');
const CorporateDashboardPricingPlans = require('../models/corporate_Dashboard_PricingPlans.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Helper function to populate related data
 */
const populateCorporateDashboardClient = async (client) => {
  const populatedData = { ...client.toObject() };
  
  // Populate CreateBy and UpdatedBy
  if (client.CreateBy) {
    const createdByUser = await User.findOne({ user_id: client.CreateBy });
    populatedData.created_by_details = createdByUser ? {
      user_id: createdByUser.user_id,
      name: createdByUser.name,
      email: createdByUser.email
    } : null;
  }

  if (client.UpdatedBy) {
    const updatedByUser = await User.findOne({ user_id: client.UpdatedBy });
    populatedData.updated_by_details = updatedByUser ? {
      user_id: updatedByUser.user_id,
      name: updatedByUser.name,
      email: updatedByUser.email
    } : null;
  }

  // Populate Plan details
  if (client.Plan_id) {
    const plan = await CorporateDashboardPricingPlans.findOne({ PricingPlans_id: client.Plan_id });
    populatedData.plan_details = plan ? {
      PricingPlans_id: plan.PricingPlans_id,
      MinBookingFee: plan.MinBookingFee,
      PriceRangeMin: plan.PriceRangeMin,
      PriceRangeMax: plan.PriceRangeMax,
      isDeposit: plan.isDeposit,
      Status: plan.Status
    } : null;
  }

  return populatedData;
};

/**
 * Create a new corporate dashboard client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCorporateDashboardClient = asyncHandler(async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      CreateBy: req.userId,
      CreateAt: new Date()
    };

    const client = await CorporateDashboardClient.create(clientData);
    const populatedClient = await populateCorporateDashboardClient(client);

    sendSuccess(res, populatedClient, 'Corporate dashboard client created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all corporate dashboard clients with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCorporateDashboardClients = asyncHandler(async (req, res) => {
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

    // Populate related data
    const populatedClients = await Promise.all(
      clients.map(client => populateCorporateDashboardClient(client))
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

    sendPaginated(res, populatedClients, 'Corporate dashboard clients retrieved successfully', paginationInfo);
  } catch (error) {
    throw error;
  }
});

/**
 * Get corporate dashboard client by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCorporateDashboardClientById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const client = await CorporateDashboardClient.findOne({ Client_id: parseInt(id) });

    if (!client) {
      return sendNotFound(res, 'Corporate dashboard client not found');
    }

    const populatedClient = await populateCorporateDashboardClient(client);
    sendSuccess(res, populatedClient, 'Corporate dashboard client retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update corporate dashboard client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCorporateDashboardClient = asyncHandler(async (req, res) => {
  try {
    const { Client_id } = req.body;

    const client = await CorporateDashboardClient.findOne({ Client_id: parseInt(Client_id) });

    if (!client) {
      return sendNotFound(res, 'Corporate dashboard client not found');
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      UpdatedBy: req.userId,
      UpdatedAt: new Date()
    };

    // Remove ID from update data to avoid updating it
    delete updateData.Client_id;

    const updatedClient = await CorporateDashboardClient.findOneAndUpdate(
      { Client_id: parseInt(Client_id) },
      updateData,
      { new: true, runValidators: true }
    );

    const populatedClient = await populateCorporateDashboardClient(updatedClient);
    sendSuccess(res, populatedClient, 'Corporate dashboard client updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete corporate dashboard client (soft delete by setting Status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCorporateDashboardClient = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const client = await CorporateDashboardClient.findOne({ Client_id: parseInt(id) });

    if (!client) {
      return sendNotFound(res, 'Corporate dashboard client not found');
    }

    // Soft delete by setting Status to false
    const deletedClient = await CorporateDashboardClient.findOneAndUpdate(
      { Client_id: parseInt(id) },
      {
        Status: false,
        UpdatedBy: req.userId,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    sendSuccess(res, deletedClient, 'Corporate dashboard client deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createCorporateDashboardClient,
  getAllCorporateDashboardClients,
  getCorporateDashboardClientById,
  updateCorporateDashboardClient,
  deleteCorporateDashboardClient
};
