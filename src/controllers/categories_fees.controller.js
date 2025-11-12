const CategoriesFees = require('../models/categories_fees.model');
const Category = require('../models/category.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

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

    const rawPlatformFee = item.PlatformFee ?? item.platform_fee ?? item.platformFee;
    if (rawPlatformFee !== undefined && rawPlatformFee !== null && rawPlatformFee !== '') {
      const platformFeeValue = Number(rawPlatformFee);
      if (Number.isNaN(platformFeeValue)) {
        throw new Error(`PlatformFee at index ${index} must be a numeric value`);
      }
      normalizedItem.PlatformFee = platformFeeValue;
    }

    const rawMinFee = item.MinFee ?? item.min_fee ?? item.minFee;
    if (rawMinFee !== undefined && rawMinFee !== null && rawMinFee !== '') {
      const minFeeValue = Number(rawMinFee);
      if (Number.isNaN(minFeeValue)) {
        throw new Error(`MinFee at index ${index} must be a numeric value`);
      }
      normalizedItem.MinFee = minFeeValue;
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
 * Helper function to populate category details
 */
const populateCategoryDetails = async (categoriesFees) => {
  if (!categoriesFees) return null;
  
  const populatedData = Array.isArray(categoriesFees) 
    ? categoriesFees.map(item => item.toObject ? item.toObject() : item)
    : [categoriesFees.toObject ? categoriesFees.toObject() : categoriesFees];
  
  const result = await Promise.all(
    populatedData.map(async (item) => {
      if (item.category_id) {
        try {
          const category = await Category.findOne({ category_id: item.category_id });
          item.category_details = category ? {
            category_id: category.category_id,
            category_name: category.category_name,
            emozi: category.emozi,
            status: category.status
          } : null;
        } catch (error) {
          item.category_details = null;
        }
      }
      return item;
    })
  );
  
  return Array.isArray(categoriesFees) ? result : result[0];
};

/**
 * Create a new categories fees
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCategoriesFees = asyncHandler(async (req, res) => {
  try {
    let categoriesFeesResult;
    try {
      categoriesFeesResult = parseCategoriesFeesInput(
        req.body.categories_fees ?? req.body
      );
    } catch (parseError) {
      return sendError(res, parseError.message, 400);
    }

    if (categoriesFeesResult?.provided) {
      // Process each categories fees item and create records
      const createdFees = [];
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
            errors.push(`Item ${i + 1}: Categories fees already exists for category_id ${item.category_id}`);
            continue;
          }

          const categoriesFeesData = {
            category_id: Number(item.category_id),
            pricing_currency: item.pricing_currency || 'USD',
            PlatformFee: item.PlatformFee !== undefined ? Number(item.PlatformFee) : 10,
            Price: item.Price !== undefined ? Number(item.Price) : undefined,
            MinFee: item.MinFee !== undefined ? Number(item.MinFee) : undefined,
            status: true,
            created_by: req.userId || 1
          };

          // Validate required fields
          if (!categoriesFeesData.Price) {
            errors.push(`Item ${i + 1}: Price is required`);
            continue;
          }

          if (categoriesFeesData.MinFee === undefined) {
            errors.push(`Item ${i + 1}: MinFee is required`);
            continue;
          }

          const categoriesFees = await CategoriesFees.create(categoriesFeesData);
          createdFees.push(categoriesFees);
        } catch (itemError) {
          errors.push(`Item ${i + 1}: ${itemError.message}`);
        }
      }

      if (createdFees.length === 0) {
        return sendError(res, `Failed to create categories fees. Errors: ${errors.join('; ')}`, 400);
      }

      // Populate category details for created records
      const populatedCategoriesFees = await populateCategoryDetails(
        createdFees.length === 1 ? createdFees[0] : createdFees
      );

      const response = {
        created: populatedCategoriesFees,
        success_count: createdFees.length,
        total_count: categoriesFeesResult.value.length
      };

      if (errors.length > 0) {
        response.errors = errors;
        response.partial_success = true;
      }

      sendSuccess(res, response, 
        errors.length > 0 
          ? `Categories fees created with some errors. ${createdFees.length} of ${categoriesFeesResult.value.length} created successfully.`
          : `Categories fees created successfully`,
        201
      );
    } else {
      // Single record creation (backward compatibility)
      if (!req.body.category_id) {
        return sendError(res, 'category_id is required', 400);
      }

      const category = await Category.findOne({ 
        category_id: Number(req.body.category_id),
        status: true 
      });
      
      if (!category) {
        return sendError(res, 'Category not found or inactive. Please provide a valid category_id.', 400);
      }

      const categoriesFeesData = {
        ...req.body,
        category_id: req.body.category_id ? Number(req.body.category_id) : undefined,
        pricing_currency: req.body.pricing_currency || 'USD',
        PlatformFee: req.body.PlatformFee !== undefined ? Number(req.body.PlatformFee) : 10,
        created_by: req.userId || 1
      };

      const categoriesFees = await CategoriesFees.create(categoriesFeesData);
      const populatedCategoriesFees = await populateCategoryDetails(categoriesFees);
      
      sendSuccess(res, populatedCategoriesFees, 'Categories Fees created successfully', 201);
    }
  } catch (error) {
    throw error;
  }
});

/**
 * Get all categories fees with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCategoriesFees = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      category_id,
      pricing_currency,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    // Search functionality removed since categoryName field was removed from model
    // Category name can be accessed via populated category_details
    if (search) {
      // If search is provided, try to find matching category_id from Category model
      try {
        const matchingCategories = await Category.find({
          category_name: { $regex: search, $options: 'i' },
          status: true
        }).select('category_id');
        
        if (matchingCategories.length > 0) {
          const categoryIds = matchingCategories.map(cat => cat.category_id);
          filter.category_id = { $in: categoryIds };
        } else {
          // If no categories match, return empty result
          filter.category_id = { $in: [] };
        }
      } catch (error) {
        // If search fails, ignore it
        console.error('Search error:', error);
      }
    }

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    if (category_id) {
      // If category_id is explicitly provided, use it (overrides search-based category_id)
      filter.category_id = parseInt(category_id, 10);
    }

    if (pricing_currency) {
      filter.pricing_currency = pricing_currency;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [categoriesFees, total] = await Promise.all([
      CategoriesFees.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      CategoriesFees.countDocuments(filter)
    ]);

    // Populate category details
    const populatedCategoriesFees = await populateCategoryDetails(categoriesFees);

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
    sendPaginated(res, populatedCategoriesFees, pagination, 'Categories Fees retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get categories fees by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCategoriesFeesById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const categoriesFees = await CategoriesFees.findOne({ categories_fees_id: parseInt(id) });

    if (!categoriesFees) {
      return sendNotFound(res, 'Categories Fees not found');
    }

    const populatedCategoriesFees = await populateCategoryDetails(categoriesFees);
    sendSuccess(res, populatedCategoriesFees, 'Categories Fees retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update categories fees by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCategoriesFees = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Validate category_id if provided
    if (req.body.category_id) {
      const category = await Category.findOne({ 
        category_id: Number(req.body.category_id),
        status: true 
      });
      
      if (!category) {
        return sendError(res, 'Category not found or inactive. Please provide a valid category_id.', 400);
      }
    }

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    // Ensure category_id is a number if provided
    if (updateData.category_id !== undefined) {
      updateData.category_id = Number(updateData.category_id);
    }

    const categoriesFees = await CategoriesFees.findOneAndUpdate(
      { categories_fees_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!categoriesFees) {
      return sendNotFound(res, 'Categories Fees not found');
    }

    const populatedCategoriesFees = await populateCategoryDetails(categoriesFees);
    sendSuccess(res, populatedCategoriesFees, 'Categories Fees updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete categories fees by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCategoriesFees = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const categoriesFees = await CategoriesFees.findOneAndUpdate(
      { categories_fees_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!categoriesFees) {
      return sendNotFound(res, 'Categories Fees not found');
    }
    sendSuccess(res, categoriesFees, 'Categories Fees deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createCategoriesFees,
  getAllCategoriesFees,
  getCategoriesFeesById,
  updateCategoriesFees,
  deleteCategoriesFees
};

