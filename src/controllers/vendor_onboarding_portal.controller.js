const VendorOnboardingPortal = require('../models/vendor_onboarding_portal.model');
const User = require('../models/user.model');
const City = require('../models/city.model');
const State = require('../models/state.model');
const Country = require('../models/country.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Helper function to populate related data
 */
const populateVendorOnboardingPortal = async (portal) => {
  const populatedData = { ...portal.toObject() };
  
  // Populate Vendor_id (User)
  if (portal.Vendor_id) {
    const vendor = await User.findOne({ user_id: portal.Vendor_id });
    populatedData.vendor_details = vendor ? {
      user_id: vendor.user_id,
      name: vendor.name,
      email: vendor.email,
      mobile: vendor.mobile
    } : null;
  }

  // Populate City
  if (portal.Basic_information_City_id) {
    const city = await City.findOne({ city_id: portal.Basic_information_City_id });
    populatedData.city_details = city ? {
      city_id: city.city_id,
      name: city.name
    } : null;
  }

  // Populate State
  if (portal.Basic_information_State_id) {
    const state = await State.findOne({ state_id: portal.Basic_information_State_id });
    populatedData.state_details = state ? {
      state_id: state.state_id,
      name: state.name
    } : null;
  }

  // Populate Country
  if (portal.Basic_information_Country_id) {
    const country = await Country.findOne({ country_id: portal.Basic_information_Country_id });
    populatedData.country_details = country ? {
      country_id: country.country_id,
      name: country.name
    } : null;
  }

  // Populate CreateBy and UpdatedBy
  if (portal.CreateBy) {
    const createdByUser = await User.findOne({ user_id: portal.CreateBy });
    populatedData.created_by_details = createdByUser ? {
      user_id: createdByUser.user_id,
      name: createdByUser.name,
      email: createdByUser.email
    } : null;
  }

  if (portal.UpdatedBy) {
    const updatedByUser = await User.findOne({ user_id: portal.UpdatedBy });
    populatedData.updated_by_details = updatedByUser ? {
      user_id: updatedByUser.user_id,
      name: updatedByUser.name,
      email: updatedByUser.email
    } : null;
  }

  return populatedData;
};

/**
 * Create a new vendor onboarding portal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVendorOnboardingPortal = asyncHandler(async (req, res) => {
  try {
    const portalData = {
      ...req.body,
      Vendor_id: req.userId,
      CreateBy: req.userId,
      CreateAt: new Date()
    };

    const portal = await VendorOnboardingPortal.create(portalData);
    const populatedPortal = await populateVendorOnboardingPortal(portal);

    sendSuccess(res, populatedPortal, 'Vendor onboarding portal created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all vendor onboarding portals with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVendorOnboardingPortals = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      Vendor_id,
      Status,
      ifConfirm
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { Basic_information_business_name: { $regex: search, $options: 'i' } },
        { Basic_information_LegalName: { $regex: search, $options: 'i' } },
        { Basic_information_Email: { $regex: search, $options: 'i' } },
        { KYC_fullname: { $regex: search, $options: 'i' } }
      ];
    }

    // Add Vendor_id filter
    if (Vendor_id) {
      filter.Vendor_id = parseInt(Vendor_id);
    }

    // Add Status filter
    if (Status !== undefined) {
      filter.Status = Status === 'true';
    }

    // Add ifConfirm filter
    if (ifConfirm !== undefined) {
      filter.ifConfirm = ifConfirm === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await VendorOnboardingPortal.countDocuments(filter);

    // Get portals with pagination
    const portals = await VendorOnboardingPortal.find(filter)
      .sort({ CreateAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Populate related data
    const populatedPortals = await Promise.all(
      portals.map(portal => populateVendorOnboardingPortal(portal))
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

    sendPaginated(res, populatedPortals, 'Vendor onboarding portals retrieved successfully', paginationInfo);
  } catch (error) {
    throw error;
  }
});

/**
 * Get vendor onboarding portal by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVendorOnboardingPortalById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const portal = await VendorOnboardingPortal.findOne({ Vendor_Onboarding_Portal_id: parseInt(id) });

    if (!portal) {
      return sendNotFound(res, 'Vendor onboarding portal not found');
    }

    const populatedPortal = await populateVendorOnboardingPortal(portal);
    sendSuccess(res, populatedPortal, 'Vendor onboarding portal retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vendor onboarding portal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVendorOnboardingPortal = asyncHandler(async (req, res) => {
  try {
    const { Vendor_Onboarding_Portal_id } = req.body;

    const portal = await VendorOnboardingPortal.findOne({ Vendor_Onboarding_Portal_id: parseInt(Vendor_Onboarding_Portal_id) });

    if (!portal) {
      return sendNotFound(res, 'Vendor onboarding portal not found');
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      UpdatedBy: req.userId,
      UpdatedAt: new Date()
    };

    // Remove ID from update data to avoid updating it
    delete updateData.Vendor_Onboarding_Portal_id;

    const updatedPortal = await VendorOnboardingPortal.findOneAndUpdate(
      { Vendor_Onboarding_Portal_id: parseInt(Vendor_Onboarding_Portal_id) },
      updateData,
      { new: true, runValidators: true }
    );

    const populatedPortal = await populateVendorOnboardingPortal(updatedPortal);
    sendSuccess(res, populatedPortal, 'Vendor onboarding portal updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete vendor onboarding portal (soft delete by setting Status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVendorOnboardingPortal = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const portal = await VendorOnboardingPortal.findOne({ Vendor_Onboarding_Portal_id: parseInt(id) });

    if (!portal) {
      return sendNotFound(res, 'Vendor onboarding portal not found');
    }

    // Soft delete by setting Status to false
    const deletedPortal = await VendorOnboardingPortal.findOneAndUpdate(
      { Vendor_Onboarding_Portal_id: parseInt(id) },
      {
        Status: false,
        UpdatedBy: req.userId,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    sendSuccess(res, deletedPortal, 'Vendor onboarding portal deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createVendorOnboardingPortal,
  getAllVendorOnboardingPortals,
  getVendorOnboardingPortalById,
  updateVendorOnboardingPortal,
  deleteVendorOnboardingPortal
};

