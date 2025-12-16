const VendorOnboardingPortal = require('../models/vendor_onboarding_portal.model');
const User = require('../models/user.model');
const City = require('../models/city.model');
const State = require('../models/state.model');
const Country = require('../models/country.model');
const BankBranchName = require('../models/bank_branch_name.model');
const BankName = require('../models/bank_name.model');
const CategoriesFees = require('../models/categories_fees.model');
const Category = require('../models/category.model');
const VendorBusinessInformation = require('../models/vendor_business_information.model');
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

  // Populate business_information_id
  if (portal.business_information_id) {
    try {
      const businessInfo = await VendorBusinessInformation.findOne({
        business_information_id: portal.business_information_id
      });
      populatedData.business_information_details = businessInfo || null;
    } catch (error) {
      populatedData.business_information_details = null;
    }
  }

  // Populate categories_fees_id
  if (portal.categories_fees_id && Array.isArray(portal.categories_fees_id) && portal.categories_fees_id.length > 0) {
    try {
      const categoriesFees = await CategoriesFees.find({
        categories_fees_id: { $in: portal.categories_fees_id },
        status: true
      });

      // Populate category details for each categories fees
      const populatedCategoriesFees = await Promise.all(
        categoriesFees.map(async (fee) => {
          const feeObj = fee.toObject();
          if (fee.category_id) {
            try {
              const category = await Category.findOne({ category_id: fee.category_id });
              feeObj.category_details = category ? {
                category_id: category.category_id,
                category_name: category.category_name,
                emozi: category.emozi,
                status: category.status
              } : null;
            } catch (error) {
              feeObj.category_details = null;
            }
          }
          return feeObj;
        })
      );

      populatedData.categories_fees_details = populatedCategoriesFees;
    } catch (error) {
      populatedData.categories_fees_details = [];
    }
  } else {
    populatedData.categories_fees_details = [];
  }

  return populatedData;
};

/**
 * Normalize categories fees input into a consistent structure
 * @param {any} input - Raw categories fees input
 * @param {string} fieldName - Field name for error messaging
 * @returns {{ provided: boolean, value?: Array }} Normalized result
 */
const parseCategoriesFeesInput = (input, fieldName = 'categories_fees') => {
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

  // If single object is provided, wrap it in an array for processing
  if (!Array.isArray(rawValue)) {
    rawValue = [rawValue];
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

    const rawPrice = item.Price ?? item.price ?? item.pricing ?? item.amount;
    if (rawPrice !== undefined && rawPrice !== null && rawPrice !== '') {
      const priceValue = Number(rawPrice);
      if (Number.isNaN(priceValue)) {
        throw new Error(`Price at index ${index} must be a numeric value`);
      }
      normalizedItem.Price = priceValue;
    }


    const rawCurrency = item.pricing_currency ?? item.currency ?? item.currency_code;
    if (rawCurrency !== undefined && rawCurrency !== null) {
      normalizedItem.pricing_currency = String(rawCurrency).trim();
    } else if (normalizedItem.Price !== undefined) {
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
    // Calculate initial_payment_required if provided
    let normalizedInitialPayment = req.body.initial_payment_required || false;

    let categoriesFeesResult;
    try {
      categoriesFeesResult = parseCategoriesFeesInput(
        req.body.categories_fees
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
    delete portalData.categories_fees;
    delete portalData.Price;
    delete portalData.service_categories;

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

    // Create categories fees records if provided
    const createdCategoriesFees = [];
    if (categoriesFeesResult?.provided && categoriesFeesResult.value && categoriesFeesResult.value.length > 0) {
      const errors = [];

      for (let i = 0; i < categoriesFeesResult.value.length; i++) {
        const item = categoriesFeesResult.value[i];

        try {
          // Validate category_id exists
          if (!item.category_id) {
            errors.push(`Item ${i + 1}: category_id is required`);
            continue;
          }

          const category = await Category.findOne({
            category_id: Number(item.category_id),
            status: true
          });

          if (!category) {
            errors.push(`Item ${i + 1}: Category not found or inactive for category_id ${item.category_id}`);
            continue;
          }

          // Check if categories fees already exists for this category_id
          const existingFees = await CategoriesFees.findOne({
            category_id: Number(item.category_id),
            status: true
          });

          if (existingFees) {
            // Update existing fees instead of creating new one
            const updateData = {
              pricing_currency: item.pricing_currency || 'USD',
              updated_by: req.userId,
              updated_at: new Date()
            };

            if (item.Price !== undefined) {
              updateData.Price = Number(item.Price);
            }

            const updatedFees = await CategoriesFees.findOneAndUpdate(
              { category_id: Number(item.category_id), status: true },
              updateData,
              { new: true }
            );
            createdCategoriesFees.push(updatedFees);
            continue;
          }

          const categoriesFeesData = {
            category_id: Number(item.category_id),
            pricing_currency: item.pricing_currency || 'USD',
            status: true,
            created_by: req.userId || 1
          };

          if (item.Price !== undefined) {
            categoriesFeesData.Price = Number(item.Price);
          }

          // Validate required fields
          if (!categoriesFeesData.Price) {
            errors.push(`Item ${i + 1}: Price is required`);
            continue;
          }


          const categoriesFees = await CategoriesFees.create(categoriesFeesData);
          createdCategoriesFees.push(categoriesFees);
        } catch (itemError) {
          errors.push(`Item ${i + 1}: ${itemError.message}`);
        }
      }

      if (errors.length > 0 && createdCategoriesFees.length === 0) {
        // If all failed, return error
        return sendError(res, `Failed to create categories fees. Errors: ${errors.join('; ')}`, 400);
      }

      // Log warnings if some failed
      if (errors.length > 0) {
        console.warn('Some categories fees creation failed:', errors);
      }

      // Update portal with created categories_fees_id
      if (createdCategoriesFees.length > 0) {
        const categoriesFeesIds = createdCategoriesFees.map(fee => fee.categories_fees_id);
        await VendorOnboardingPortal.findOneAndUpdate(
          { Vendor_Onboarding_Portal_id: portal.Vendor_Onboarding_Portal_id },
          { categories_fees_id: categoriesFeesIds },
          { new: true }
        );
        portal.categories_fees_id = categoriesFeesIds;
      }
    }

    const populatedPortal = await populateVendorOnboardingPortal(portal);

    // Add created categories fees to response
    const response = {
      ...populatedPortal,
      categories_fees: createdCategoriesFees.length > 0 ? createdCategoriesFees : undefined
    };

    sendSuccess(res, response, 'Vendor onboarding portal created successfully', 201);
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
    delete updateData.categories;
    delete updateData.service_categories;
    delete updateData.categories_fees;
    delete updateData.Price;

    // Handle categories_fees if provided
    let categoriesFeesResult;
    if (req.body.categories_fees) {
      try {
        categoriesFeesResult = parseCategoriesFeesInput(
          req.body.categories_fees
        );
      } catch (parseError) {
        return sendError(res, parseError.message, 400);
      }
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

    // Handle categories_fees if provided
    if (categoriesFeesResult?.provided && categoriesFeesResult.value && categoriesFeesResult.value.length > 0) {
      const createdCategoriesFees = [];
      const errors = [];

      for (let i = 0; i < categoriesFeesResult.value.length; i++) {
        const item = categoriesFeesResult.value[i];

        try {
          // Validate category_id exists
          if (!item.category_id) {
            errors.push(`Item ${i + 1}: category_id is required`);
            continue;
          }

          const category = await Category.findOne({
            category_id: Number(item.category_id),
            status: true
          });

          if (!category) {
            errors.push(`Item ${i + 1}: Category not found or inactive for category_id ${item.category_id}`);
            continue;
          }

          // Check if categories fees already exists for this category_id
          const existingFees = await CategoriesFees.findOne({
            category_id: Number(item.category_id),
            status: true
          });

          if (existingFees) {
            // Update existing fees instead of creating new one
            const updateData = {
              pricing_currency: item.pricing_currency || 'USD',
              updated_by: req.userId,
              updated_at: new Date()
            };

            if (item.Price !== undefined) {
              updateData.Price = Number(item.Price);
            }

            const updatedFees = await CategoriesFees.findOneAndUpdate(
              { category_id: Number(item.category_id), status: true },
              updateData,
              { new: true }
            );
            createdCategoriesFees.push(updatedFees);
            continue;
          }

          const categoriesFeesData = {
            category_id: Number(item.category_id),
            pricing_currency: item.pricing_currency || 'USD',
            status: true,
            created_by: req.userId || 1
          };

          if (item.Price !== undefined) {
            categoriesFeesData.Price = Number(item.Price);
          }

          // Validate required fields
          if (!categoriesFeesData.Price) {
            errors.push(`Item ${i + 1}: Price is required`);
            continue;
          }


          const categoriesFees = await CategoriesFees.create(categoriesFeesData);
          createdCategoriesFees.push(categoriesFees);
        } catch (itemError) {
          errors.push(`Item ${i + 1}: ${itemError.message}`);
        }
      }

      // Update portal with categories_fees_id
      if (createdCategoriesFees.length > 0) {
        const categoriesFeesIds = createdCategoriesFees.map(fee => fee.categories_fees_id);
        // Merge with existing categories_fees_id if any
        const existingIds = updatedPortal.categories_fees_id || [];
        const mergedIds = [...new Set([...existingIds, ...categoriesFeesIds])];

        await VendorOnboardingPortal.findOneAndUpdate(
          { Vendor_Onboarding_Portal_id: parseInt(Vendor_Onboarding_Portal_id) },
          { categories_fees_id: mergedIds },
          { new: true }
        );
        updatedPortal.categories_fees_id = mergedIds;
      }

      if (errors.length > 0) {
        console.warn('Some categories fees update failed:', errors);
      }
    }

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
    const { min_price, max_price } = req.query;
    
    const filter = { Status: true };

    // If price range is provided, filter vendors by their categories fees
    let priceFilteredCategoriesFeesIds = null;
    if (min_price !== undefined || max_price !== undefined) {
      const priceFilter = { status: true };
      
      if (min_price !== undefined && max_price !== undefined) {
        priceFilter.Price = {
          $gte: parseFloat(min_price),
          $lte: parseFloat(max_price)
        };
      } else if (min_price !== undefined) {
        priceFilter.Price = { $gte: parseFloat(min_price) };
      } else if (max_price !== undefined) {
        priceFilter.Price = { $lte: parseFloat(max_price) };
      }

      const matchingCategoriesFees = await CategoriesFees.find(priceFilter).select('categories_fees_id');
      priceFilteredCategoriesFeesIds = matchingCategoriesFees.map(fee => fee.categories_fees_id);
      
      // If no categories match the price range, return empty array
      if (priceFilteredCategoriesFeesIds.length === 0) {
        return sendSuccess(res, [], 'Vendor details retrieved successfully');
      }
      
      // Filter vendors that have at least one category fee in the price range
      filter.categories_fees_id = { $in: priceFilteredCategoriesFeesIds };
    }

    const portals = await VendorOnboardingPortal.find(filter)
      .sort({ CreateAt: -1 });

    const populatedPortals = await Promise.all(
      portals.map(portal => populateVendorOnboardingPortal(portal))
    );

    const vendorsWithRole = populatedPortals.filter(portal => {
      const roleId = portal.vendor_details?.role_id;
      return roleId !== undefined && roleId !== null ? Number(roleId) === 3 : false;
    });

    sendSuccess(res, vendorsWithRole, 'Vendor details retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Create vendor portal with business information, bank details, and categories fees
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVendorPortal = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;
    const user = await VendorOnboardingPortal.findOne({ Vendor_id: userId, Status: true });
    if (user) {
      return sendError(res, 'Vendor portal already exists Update only your portal', 400);
    } else {
      // Step 1: Create VendorBusinessInformation
      const businessInfoData = {
        business_name: req.body.Basic_information_business_name,
        Basic_information_LegalName: req.body.Basic_information_LegalName,
        business_email: req.body.Basic_information_Email,
        business_phone: req.body.Basic_information_phone,
        description: req.body.Basic_information_Business_Description,
        Basic_information_Business_Description: req.body.Basic_information_Business_Description,
        Basic_information_BusinessAddress: req.body.Basic_information_BusinessAddress,
        Basic_information_City_id: req.body.Basic_information_City_id,
        Basic_information_State_id: req.body.Basic_information_State_id,
        Basic_information_ZipCode: req.body.Basic_information_ZipCode,
        Basic_information_Country_id: req.body.Basic_information_Country_id,
        Document_Business_Regis_Certificate: req.body.Document_Business_Regis_Certificate,
        Document_GSTTaxCertificate: req.body.Document_GSTTaxCertificate,
        Document_Pan: req.body.Document_Pan,
        Document_bankbook: req.body.Document_bankbook,
        Document_IDproofOwner: req.body.Document_IDproofOwner,
        Document_TradeLicense: req.body.Document_TradeLicense,
        KYC_fullname: req.body.KYC_fullname,
        KYC_DoB: req.body.KYC_DoB ? new Date(req.body.KYC_DoB) : undefined,
        KYC_GovtIdtype: req.body.KYC_GovtIdtype,
        KYC_Idno: req.body.KYC_Idno,
        KYC_Business_PanCard: req.body.KYC_Business_PanCard,
        KYC_GSTNo: req.body.KYC_GSTNo,
        KYC_UploadIdDocument: req.body.KYC_UploadIdDocument,
        KYC_photo: req.body.KYC_photo,
        service_areas_locaiton: req.body.service_areas_locaiton,
        service_areas_Regions: req.body.service_areas_Regions,
        service_areas_pincode: req.body.service_areas_pincode,
        service_areas_workingHoures: req.body.service_areas_workingHoures,
        vendor_id: userId,
        created_by: userId,
        status: req.body.Status !== undefined ? req.body.Status : true
      };

      const businessInfo = await VendorBusinessInformation.create(businessInfoData);

      // Step 2: Create BankBranchName from Payment_Setup fields
      let bankBranchNameId = null;
      if (req.body.Payment_Setup_HolderName && req.body.Payment_Setup_AccountNo && req.body.Payment_Setup_BranchName) {
        // Find or create BankName
        let bankNameId = req.body.bank_name_id;

        if (!bankNameId) {
          // Try to find bank by name
          const existingBank = await BankName.findOne({
            bank_name: "ICI_Bank",
            status: true
          });

          if (existingBank) {
            bankNameId = existingBank.bank_name_id;
          } else {
            // Create new bank if not found
            const newBank = await BankName.create({
              bank_name: "ICI_Bank",
              status: true,
              created_by: userId
            });
            bankNameId = newBank.bank_name_id;
          }
        }

        if (!bankNameId) {
          return sendError(res, 'bank_name_id is required. Please provide either bank_name_id or ICI_Bank', 400);
        }

        const bankBranchData = {
          bank_branch_name: req.body.Payment_Setup_BranchName,
          bank_name_id: bankNameId,
          holderName: req.body.Payment_Setup_HolderName,
          upi: req.body.Payment_Setup_UPI || null,
          ifsc: req.body.Payment_Setup_Ifsc || null,
          accountNo: req.body.Payment_Setup_AccountNo,
          address: req.body.Basic_information_BusinessAddress || '',
          zipcode: req.body.Basic_information_ZipCode || '',
          status: true,
          created_by: userId,
          updated_by: userId
        };

        const bankBranch = await BankBranchName.create(bankBranchData);
        bankBranchNameId = bankBranch.bank_branch_name_id;
      }

      // Step 3: Create CategoriesFees from service_categories
      const categoriesFeesIds = [];
      if (req.body.service_categories && Array.isArray(req.body.service_categories) && req.body.service_categories.length > 0) {
        for (const item of req.body.service_categories) {
          try {
            // Validate category_id exists
            if (!item.category_id) {
              continue;
            }

            const category = await Category.findOne({
              category_id: Number(item.category_id),
              status: true
            });

            if (!category) {
              continue;
            }

            // Check if categories fees already exists for this category_id
            const existingFees = await CategoriesFees.findOne({
              category_id: Number(item.category_id),
              status: true
            });

            if (existingFees) {
              // Update existing fees
              const updateData = {
                pricing_currency: item.pricing_currency || 'USD',
                updated_by: userId,
                updated_at: new Date()
              };

              if (item.Price !== undefined) {
                updateData.Price = Number(item.Price);
              }

              const updatedFees = await CategoriesFees.findOneAndUpdate(
                { category_id: Number(item.category_id), status: true },
                updateData,
                { new: true }
              );
              categoriesFeesIds.push(updatedFees.categories_fees_id);
              continue;
            }

            // Validate required fields
            if (!item.Price) {
              continue;
            }

            const categoriesFeesData = {
              category_id: Number(item.category_id),
              pricing_currency: item.pricing_currency || 'USD',
              Price: Number(item.Price),
              status: true,
              created_by: userId
            };

            const categoriesFees = await CategoriesFees.create(categoriesFeesData);
            categoriesFeesIds.push(categoriesFees.categories_fees_id);
          } catch (itemError) {
            console.error('Error creating categories fees:', itemError);
            // Continue with other items
          }
        }
      }

      // Step 4: Calculate initial_payment_required
      let initialPaymentRequired = req.body.initial_payment_required || false;

      // Step 5: Create VendorOnboardingPortal
      const portalData = {
        Vendor_id: userId,
        business_information_id: businessInfo.business_information_id,
        bank_branch_name_id: bankBranchNameId,
        categories_fees_id: categoriesFeesIds,
        initial_payment_required: initialPaymentRequired,
        CancellationCharges: req.body.CancellationCharges !== undefined ? Number(req.body.CancellationCharges) : 0,
        EscrowPayment: req.body.EscrowPayment !== undefined ? Boolean(req.body.EscrowPayment) : false,
        ifConfirm: req.body.ifConfirm !== undefined ? req.body.ifConfirm : false,
        Status: req.body.Status !== undefined ? req.body.Status : true,
        CreateBy: userId,
        CreateAt: new Date()
      };

      const portal = await VendorOnboardingPortal.create(portalData);

      // Step 6: Populate and return
      const populatedPortal = await populateVendorOnboardingPortal(portal);
      sendSuccess(res, populatedPortal, 'Vendor portal created successfully', 201);
    }
  } catch (error) {
    console.error('Error creating vendor portal:', error);
    throw error;
  }

});

module.exports = {
  createVendorOnboardingPortal,
  getAllVendorOnboardingPortals,
  getVendorOnboardingPortalById,
  updateVendorOnboardingPortal,
  deleteVendorOnboardingPortal,
  getVendorFullDetailsPublic,
  createVendorPortal
};

