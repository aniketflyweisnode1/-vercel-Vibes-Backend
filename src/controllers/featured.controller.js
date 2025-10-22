const Featured = require('../models/featured.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new featured
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createFeatured = asyncHandler(async (req, res) => {
  try {
    // Create featured data
    const featuredData = {
      ...req.body,
      created_by: req.userId
    };

    // Create featured
    const featured = await Featured.create(featuredData);
    sendSuccess(res, featured, 'Featured created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all featured with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllFeatured = asyncHandler(async (req, res) => {
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
    const [featureds, total] = await Promise.all([
      Featured.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Featured.countDocuments(filter)
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
    sendPaginated(res, featureds, pagination, 'Featured retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get featured by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFeaturedById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const featured = await Featured.findOne({ 
      Featured_id: parseInt(id) 
    });

    if (!featured) {
      return sendNotFound(res, 'Featured not found');
    }
    sendSuccess(res, featured, 'Featured retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update featured by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateFeatured = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const featured = await Featured.findOneAndUpdate(
      { Featured_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!featured) {
      return sendNotFound(res, 'Featured not found');
    }
    sendSuccess(res, featured, 'Featured updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update featured by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateFeaturedByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const featured = await Featured.findOneAndUpdate(
      { Featured_id: parseInt(id) },
      finalUpdateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!featured) {
      return sendNotFound(res, 'Featured not found');
    }
    sendSuccess(res, featured, 'Featured updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete featured by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteFeatured = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const featured = await Featured.findOneAndUpdate(
      { Featured_id: parseInt(id) },
      { 
        Status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!featured) {
      return sendNotFound(res, 'Featured not found');
    }
    sendSuccess(res, featured, 'Featured deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createFeatured,
  getAllFeatured,
  getFeaturedById,
  updateFeatured,
  updateFeaturedByIdBody,
  deleteFeatured
};
