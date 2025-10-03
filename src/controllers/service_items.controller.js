const ServiceItems = require('../models/service_items.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new service item
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createServiceItem = asyncHandler(async (req, res) => {
  try {
    const serviceItemData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create service item
    const serviceItem = await ServiceItems.create(serviceItemData);

    logger.info('Service item created successfully', { 
      serviceItemId: serviceItem._id, 
      service_items_id: serviceItem.service_items_id 
    });

    sendSuccess(res, serviceItem, 'Service item created successfully', 201);
  } catch (error) {
    logger.error('Error creating service item', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all service items with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllServiceItems = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      vendor_service_type_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
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

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [serviceItems, total] = await Promise.all([
      ServiceItems.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      ServiceItems.countDocuments(filter)
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

    logger.info('Service items retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, serviceItems, pagination, 'Service items retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving service items', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get service item by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getServiceItemById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const serviceItem = await ServiceItems.findOne({service_items_id: parseInt(id)});

    if (!serviceItem) {
      return sendNotFound(res, 'Service item not found');
    }

    logger.info('Service item retrieved successfully', { serviceItemId: serviceItem._id });

    sendSuccess(res, serviceItem, 'Service item retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving service item', { error: error.message, serviceItemId: req.params.id });
    throw error;
  }
});

/**
 * Update service item by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateServiceItem = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Validate ID
    if (!id) {
      return sendError(res, 'Valid service item ID is required', 400);
    }

    const serviceItemId = id;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const serviceItem = await ServiceItems.findOneAndUpdate(
      {service_items_id: serviceItemId},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!serviceItem) {
      return sendNotFound(res, 'Service item not found');
    }

    logger.info('Service item updated successfully', { serviceItemId: serviceItem._id });

    sendSuccess(res, serviceItem, 'Service item updated successfully');
  } catch (error) {
    logger.error('Error updating service item', { error: error.message, serviceItemId: req.params.id });
    throw error;
  }
});

module.exports = {
  createServiceItem,
  getAllServiceItems,
  getServiceItemById,
  updateServiceItem
};
