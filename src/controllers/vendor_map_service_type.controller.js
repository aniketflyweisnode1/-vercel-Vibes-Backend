const VendorMapServiceType = require('../models/vendor_map_service_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new vendor map service type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVendorMapServiceType = asyncHandler(async (req, res) => {
  try {
    const vendorMapServiceTypeData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create vendor map service type
    const vendorMapServiceType = await VendorMapServiceType.create(vendorMapServiceTypeData);

    logger.info('Vendor map service type created successfully', { 
      vendorMapServiceTypeId: vendorMapServiceType._id, 
      vendor_map_service_id: vendorMapServiceType.vendor_map_service_id 
    });

    sendSuccess(res, vendorMapServiceType, 'Vendor map service type created successfully', 201);
  } catch (error) {
    logger.error('Error creating vendor map service type', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all vendor map service types with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVendorMapServiceTypes = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      vendor_service_type_id,
      vendor_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { vendor_service_type_id: { $regex: search, $options: 'i' } },
        { vendor_id: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = 'true';
    }

    // Add vendor service type filter
    if (vendor_service_type_id) {
      filter.vendor_service_type_id = parseInt(vendor_service_type_id);
    }

    // Add vendor filter
    if (vendor_id) {
      filter.vendor_id = parseInt(vendor_id);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [vendorMapServiceTypes, total] = await Promise.all([
      VendorMapServiceType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      VendorMapServiceType.countDocuments(filter)
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

    logger.info('Vendor map service types retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, vendorMapServiceTypes, pagination, 'Vendor map service types retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving vendor map service types', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get vendor map service type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVendorMapServiceTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const vendorMapServiceType = await VendorMapServiceType.findOne({vendor_map_service_id: parseInt(id)});

    if (!vendorMapServiceType) {
      return sendNotFound(res, 'Vendor map service type not found');
    }

    logger.info('Vendor map service type retrieved successfully', { vendorMapServiceTypeId: vendorMapServiceType._id });

    sendSuccess(res, vendorMapServiceType, 'Vendor map service type retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving vendor map service type', { error: error.message, vendorMapServiceTypeId: req.params.id });
    throw error;
  }
});

/**
 * Update vendor map service type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVendorMapServiceType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Validate ID
    if (!id) {
      return sendError(res, 'Valid vendor map service type ID is required', 400);
    }

      const vendorMapServiceTypeId = id;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const vendorMapServiceType = await VendorMapServiceType.findOneAndUpdate(
      {vendor_map_service_id: vendorMapServiceTypeId},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!vendorMapServiceType) {
      return sendNotFound(res, 'Vendor map service type not found');
    }

    logger.info('Vendor map service type updated successfully', { vendorMapServiceTypeId: vendorMapServiceType._id });

    sendSuccess(res, vendorMapServiceType, 'Vendor map service type updated successfully');
  } catch (error) {
    logger.error('Error updating vendor map service type', { error: error.message, vendorMapServiceTypeId: req.params.id });
    throw error;
  }
});

module.exports = {
  createVendorMapServiceType,
  getAllVendorMapServiceTypes,
  getVendorMapServiceTypeById,
  updateVendorMapServiceType
};
