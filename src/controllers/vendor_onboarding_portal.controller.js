const VendorOnboardingPortal = require('../models/vendor_onboarding_portal.model');
const User = require('../models/user.model');
const City = require('../models/city.model');
const State = require('../models/state.model');
const Country = require('../models/country.model');
const BankBranchName = require('../models/bank_branch_name.model');
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
      mobile: vendor.mobile,
      role_id: vendor.role_id
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

  if (portal.bank_branch_name_id) {
    try {
      const bankBranch = await BankBranchName.findOne({ bank_branch_name_id: portal.bank_branch_name_id });
      populatedData.bank_branch_details = bankBranch || null;
    } catch (error) {
      populatedData.bank_branch_details = null;
    }
  }

  return populatedData;
};

/**
 * Normalize service category input into a consistent array structure
 * @param {any} input - Raw categories input
 * @param {string} fieldName - Field name for error messaging
 * @returns {{ provided: boolean, value?: Array }} Normalized result
 */
const parseServiceCategoriesInput = (input, fieldName = 'service_categories') => {
  if (input === undefined) {
    return { provided: false };
  }

  let rawValue = input;

  if (typeof rawValue === 'string') {
    if (!rawValue.trim()) {
      return { provided: true, value: [] };
    }
    try {
      rawValue = JSON.parse(rawValue);
    } catch (error) {
      throw new Error(`${fieldName} must be a valid JSON array`);
    }
  }

  if (!Array.isArray(rawValue)) {
    throw new Error(`${fieldName} must be an array of category objects`);
  }

  const normalized = [];

  rawValue.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      return;
    }

    const normalizedItem = {};

    if (item.category_id !== undefined && item.category_id !== null && item.category_id !== '') {
      const categoryId = Number(item.category_id);
      if (Number.isNaN(categoryId)) {
        throw new Error(`category_id at index ${index} must be a numeric value`);
      }
      normalizedItem.category_id = categoryId;
    }

    if (item.category_name !== undefined && item.category_name !== null) {
      normalizedItem.category_name = String(item.category_name).trim();
    }

    const rawPricing = item.pricing ?? item.price ?? item.amount;
    if (rawPricing !== undefined && rawPricing !== null && rawPricing !== '') {
      const pricingValue = Number(rawPricing);
      if (Number.isNaN(pricingValue)) {
        throw new Error(`pricing at index ${index} must be a numeric value`);
      }
      normalizedItem.pricing = pricingValue;
    }

    const rawCurrency = item.pricing_currency ?? item.currency ?? item.currency_code;
    if (rawCurrency !== undefined && rawCurrency !== null) {
      normalizedItem.pricing_currency = String(rawCurrency).trim();
    } else if (normalizedItem.pricing !== undefined) {
      normalizedItem.pricing_currency = 'USD';
    }

    if (Object.keys(normalizedItem).length > 0) {
      normalized.push(normalizedItem);
    }
  });

  return { provided: true, value: normalized };
};

/**
 * Create a new vendor onboarding portal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVendorOnboardingPortal = asyncHandler(async (req, res) => {
  try {
    const initialPaymentInput = req.body.initial_payment_required;
    const normalizedInitialPayment = initialPaymentInput === undefined
      ? false
      : (typeof initialPaymentInput === 'string'
        ? initialPaymentInput === 'true'
        : Boolean(initialPaymentInput));

    let serviceCategoriesResult;
    try {
      serviceCategoriesResult = parseServiceCategoriesInput(
        req.body.service_categories 
      );
    } catch (parseError) {
      return sendError(res, parseError.message, 400);
    }

    const portalData = {
      ...req.body,
      initial_payment_required: normalizedInitialPayment,
      Vendor_id: req.userId,
      CreateBy: req.userId,
      CreateAt: new Date()
    };

    delete portalData.categories;

    if (serviceCategoriesResult?.provided) {
      portalData.service_categories = serviceCategoriesResult.value;
    } else {
      delete portalData.service_categories;
    }

    if (Object.prototype.hasOwnProperty.call(portalData, 'bank_branch_name_id')) {
      if (portalData.bank_branch_name_id === null || portalData.bank_branch_name_id === '' || portalData.bank_branch_name_id === undefined) {
        portalData.bank_branch_name_id = null;
      } else {
        const parsedBranchId = parseInt(portalData.bank_branch_name_id, 10);
        if (Number.isNaN(parsedBranchId)) {
          return sendError(res, 'bank_branch_name_id must be a numeric value', 400);
        }

        const bankBranch = await BankBranchName.findOne({
          bank_branch_name_id: parsedBranchId,
          created_by: req.userId
        });

        if (!bankBranch) {
          const { bank_branch_name, holderName, upi, ifsc, accountNo, address, cardNo, zipcode, emoji, bank_name_id } = req.body.bank_branch_details || {};

          if (!bank_branch_name || !holderName || !accountNo || !address || !zipcode) {
            return sendError(res, 'Bank branch not found for the provided bank_branch_name_id and insufficient details to create a new branch', 400);
          }

          const newBankBranch = await BankBranchName.create({
            bank_branch_name: bank_branch_name,
            bank_name_id: bank_name_id || null,
            holderName,
            upi: upi || null,
            ifsc: ifsc || null,
            accountNo,
            address,
            cardNo: cardNo || null,
            zipcode,
            emoji: emoji || null,
            status: true,
            created_by: req.userId,
            updated_by: req.userId
          });

          portalData.bank_branch_name_id = newBankBranch.bank_branch_name_id;
        } else {
          portalData.bank_branch_name_id = parsedBranchId;
        }
      }

      delete portalData.bank_branch_details;
    }

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

    let serviceCategoriesResult;
    const categoriesProvided = Object.prototype.hasOwnProperty.call(req.body, 'service_categories')
      || Object.prototype.hasOwnProperty.call(req.body, 'categories');

    if (categoriesProvided) {
      try {
        serviceCategoriesResult = parseServiceCategoriesInput(
          req.body.service_categories ?? req.body.categories
        );
      } catch (parseError) {
        return sendError(res, parseError.message, 400);
      }
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      UpdatedBy: req.userId,
      UpdatedAt: new Date()
    };

    // Remove ID from update data to avoid updating it
    delete updateData.Vendor_Onboarding_Portal_id;
    delete updateData.categories;

    if (categoriesProvided) {
      updateData.service_categories = serviceCategoriesResult?.value ?? [];
    } else {
      delete updateData.service_categories;
    }

    if (Object.prototype.hasOwnProperty.call(updateData, 'bank_branch_name_id')) {
      if (updateData.bank_branch_name_id === null || updateData.bank_branch_name_id === '' || updateData.bank_branch_name_id === undefined) {
        updateData.bank_branch_name_id = null;
      } else {
        const parsedBranchId = parseInt(updateData.bank_branch_name_id, 10);
        if (Number.isNaN(parsedBranchId)) {
          return sendError(res, 'bank_branch_name_id must be a numeric value', 400);
        }

        let bankBranch = await BankBranchName.findOne({
          bank_branch_name_id: parsedBranchId,
          created_by: req.userId
        });

        if (!bankBranch) {
          const { bank_branch_name, holderName, upi, ifsc, accountNo, address, cardNo, zipcode, emoji, bank_name_id } = updateData.bank_branch_details || {};

          if (!bank_branch_name || !holderName || !accountNo || !address || !zipcode) {
            return sendError(res, 'Bank branch not found for the provided bank_branch_name_id and insufficient details to create a new branch', 400);
          }

          bankBranch = await BankBranchName.create({
            bank_branch_name: bank_branch_name,
            bank_name_id: bank_name_id || null,
            holderName,
            upi: upi || null,
            ifsc: ifsc || null,
            accountNo,
            address,
            cardNo: cardNo || null,
            zipcode,
            emoji: emoji || null,
            status: true,
            created_by: req.userId,
            updated_by: req.userId
          });
        }

        updateData.bank_branch_name_id = bankBranch.bank_branch_name_id;
      }

      delete updateData.bank_branch_details;
    }

    if (updateData.initial_payment_required !== undefined) {
      updateData.initial_payment_required = typeof updateData.initial_payment_required === 'string'
        ? updateData.initial_payment_required === 'true'
        : Boolean(updateData.initial_payment_required);
    }

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

/**
 * Get public vendor details with categories and pricing (no auth)
 */
const getVendorFullDetailsPublic = asyncHandler(async (req, res) => {
  try {
    const filter = { Status: true };

    const portals = await VendorOnboardingPortal.find(filter)
      .sort({ CreateAt: -1 });

    const populatedPortals = await Promise.all(
      portals.map(portal => populateVendorOnboardingPortal(portal))
    );

    const vendorsWithRole = populatedPortals.filter(portal => {
      const roleId = portal.vendor_details?.role_id;
      const hasServiceCategories = portal.service_categories && 
        Array.isArray(portal.service_categories) && 
        portal.service_categories.length > 0;
      return (roleId !== undefined && roleId !== null ? Number(roleId) === 3 : false) && hasServiceCategories;
    });

    sendSuccess(res, vendorsWithRole, 'Vendor details retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createVendorOnboardingPortal,
  getAllVendorOnboardingPortals,
  getVendorOnboardingPortalById,
  updateVendorOnboardingPortal,
  deleteVendorOnboardingPortal,
  getVendorFullDetailsPublic
};

