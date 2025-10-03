const VendorBusinessInformation = require('../models/vendor_business_information.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new vendor business information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVendorBusinessInformation = asyncHandler(async (req, res) => {
  try {
    // Create vendor business information data
    const businessInfoData = {
      ...req.body,
      vendor_id: req.userId || req.body.vendor_id,
      created_by: req.userId || null
    };

    // Create vendor business information
    const businessInfo = await VendorBusinessInformation.create(businessInfoData);

    logger.info('Vendor business information created successfully', { 
      businessInfoId: businessInfo._id, 
      business_information_id: businessInfo.business_information_id 
    });

    sendSuccess(res, businessInfo, 'Vendor business information created successfully', 201);
  } catch (error) {
    logger.error('Error creating vendor business information', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all vendor business information with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVendorBusinessInformation = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      approval_by_admin,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { business_name: { $regex: search, $options: 'i' } },
        { business_email: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = 'true';
    }

    // Add approval filter
    if (approval_by_admin !== undefined) {
      filter.approval_by_admin = approval_by_admin === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [businessInfo, total] = await Promise.all([
      VendorBusinessInformation.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      VendorBusinessInformation.countDocuments(filter)
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

    logger.info('Vendor business information retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, businessInfo, pagination, 'Vendor business information retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving vendor business information', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get vendor business information by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVendorBusinessInformationById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const businessInfo = await VendorBusinessInformation.findOne({ 
      business_information_id: parseInt(id) 
    });

    if (!businessInfo) {
      return sendNotFound(res, 'Vendor business information not found');
    }

    logger.info('Vendor business information retrieved successfully', { businessInfoId: businessInfo._id });

    sendSuccess(res, businessInfo, 'Vendor business information retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving vendor business information', { 
      error: error.message, 
      businessInfoId: req.params.id 
    });
    throw error;
  }
});

/**
 * Get vendor business information by authenticated vendor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVendorBusinessInformationByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      approval_by_admin,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {
      vendor_id: req.userId
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { business_name: { $regex: search, $options: 'i' } },
        { business_email: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = 'true';
    }

    // Add approval filter
    if (approval_by_admin !== undefined) {
      filter.approval_by_admin = approval_by_admin === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [businessInfo, total] = await Promise.all([
      VendorBusinessInformation.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      VendorBusinessInformation.countDocuments(filter)
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

    logger.info('Vendor business information retrieved by auth successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit),
      vendorId: req.userId
    });

    sendPaginated(res, businessInfo, pagination, 'Vendor business information retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving vendor business information by auth', { 
      error: error.message, 
      vendorId: req.userId 
    });
    throw error;
  }
});

/**
 * Update vendor business information by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVendorBusinessInformation = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const businessInfo = await VendorBusinessInformation.findOneAndUpdate(
      { business_information_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!businessInfo) {
      return sendNotFound(res, 'Vendor business information not found');
    }

    logger.info('Vendor business information updated successfully', { businessInfoId: businessInfo._id });

    sendSuccess(res, businessInfo, 'Vendor business information updated successfully');
  } catch (error) {
    logger.error('Error updating vendor business information', { 
      error: error.message, 
      businessInfoId: req.params.id 
    });
    throw error;
  }
});

/**
 * Update vendor business information by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVendorBusinessInformationByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const businessInfo = await VendorBusinessInformation.findOneAndUpdate(
      { business_information_id: parseInt(id) },
      finalUpdateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!businessInfo) {
      return sendNotFound(res, 'Vendor business information not found');
    }

    logger.info('Vendor business information updated successfully by ID in body', { 
      businessInfoId: businessInfo._id, 
      updatedBy: req.userId 
    });

    sendSuccess(res, businessInfo, 'Vendor business information updated successfully');
  } catch (error) {
    logger.error('Error updating vendor business information by ID in body', { 
      error: error.message, 
      businessInfoId: req.body.id 
    });
    throw error;
  }
});

/**
 * Delete vendor business information by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVendorBusinessInformation = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const businessInfo = await VendorBusinessInformation.findOneAndUpdate(
      { business_information_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!businessInfo) {
      return sendNotFound(res, 'Vendor business information not found');
    }

    logger.info('Vendor business information deleted successfully', { businessInfoId: businessInfo._id });

    sendSuccess(res, businessInfo, 'Vendor business information deleted successfully');
  } catch (error) {
    logger.error('Error deleting vendor business information', { 
      error: error.message, 
      businessInfoId: req.params.id 
    });
    throw error;
  }
});

module.exports = {
  createVendorBusinessInformation,
  getAllVendorBusinessInformation,
  getVendorBusinessInformationById,
  getVendorBusinessInformationByAuth,
  updateVendorBusinessInformation,
  updateVendorBusinessInformationByIdBody,
  deleteVendorBusinessInformation
};
