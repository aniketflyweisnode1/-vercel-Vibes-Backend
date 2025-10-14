const VendorServiceType = require('../models/vendor_service_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new vendor service type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVendorServiceType = asyncHandler(async (req, res) => {
  try {
    const vendorServiceTypeData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create vendor service type
    const vendorServiceType = await VendorServiceType.create(vendorServiceTypeData);
    sendSuccess(res, vendorServiceType, 'Vendor service type created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all vendor service types with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVendorServiceTypes = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { emoji: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
  

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [vendorServiceTypes, total] = await Promise.all([
      VendorServiceType.find()
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      VendorServiceType.countDocuments(filter)
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
    sendPaginated(res, vendorServiceTypes, pagination, 'Vendor service types retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vendor service type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVendorServiceTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const vendorServiceType = await VendorServiceType.findOne({vendor_service_type_id: parseInt(id)});

    if (!vendorServiceType) {
      return sendNotFound(res, 'Vendor service type not found');
    }
    sendSuccess(res, vendorServiceType, 'Vendor service type retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vendor service type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVendorServiceType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Validate ID
    if (!id) {
      return sendError(res, 'Valid vendor service type ID is required', 400);
    }

    const vendorServiceTypeId = id;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const vendorServiceType = await VendorServiceType.findOneAndUpdate(
      {vendor_service_type_id: vendorServiceTypeId},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!vendorServiceType) {
      return sendNotFound(res, 'Vendor service type not found');
    }
    sendSuccess(res, vendorServiceType, 'Vendor service type updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete vendor service type by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVendorServiceType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return sendError(res, 'Valid vendor service type ID is required', 400);
    }

    const vendorServiceTypeId = id;

    const vendorServiceType = await VendorServiceType.findOneAndUpdate(
      {vendor_service_type_id: vendorServiceTypeId},
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!vendorServiceType) {
      return sendNotFound(res, 'Vendor service type not found');
    }
    sendSuccess(res, vendorServiceType, 'Vendor service type deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vendor service types created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVendorServiceTypesByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object - only show vendor service types created by the authenticated user
    const filter = {
      created_by: req.userId
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { emoji: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
  

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [vendorServiceTypes, total] = await Promise.all([
      VendorServiceType.find()
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      VendorServiceType.countDocuments(filter)
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
    sendPaginated(res, vendorServiceTypes, pagination, 'User vendor service types retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createVendorServiceType,
  getAllVendorServiceTypes,
  getVendorServiceTypeById,
  updateVendorServiceType,
  deleteVendorServiceType,
  getVendorServiceTypesByAuth
};

