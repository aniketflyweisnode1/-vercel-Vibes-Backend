const MarketPlaceServiceCharges = require('../models/marketplace_service_charges.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Create a new marketplace service charge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createMarketPlaceServiceCharges = asyncHandler(async (req, res) => {
  try {
    console.log("pankaj", req.body);
    const serviceChargesData = {
      ...req.body,
      created_by: req.userId || 1
    };

    const serviceCharges = await MarketPlaceServiceCharges.create(serviceChargesData);

    logger.info('MarketPlace Service Charges created successfully', { 
      serviceChargesId: serviceCharges._id, 
      service_charges_id: serviceCharges.service_charges_id 
    });

    sendSuccess(res, serviceCharges, 'MarketPlace Service Charges created successfully', 201);
  } catch (error) {
    logger.error('Error creating marketplace service charges', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get all marketplace service charges with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllMarketPlaceServiceCharges = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      category_id,
      location,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.service_name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.status = 'true';
    }

    if (user_id) {
      filter.user_id = parseInt(user_id);
    }

    if (category_id) {
      filter.category_id = parseInt(category_id);
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [serviceCharges, total] = await Promise.all([
      MarketPlaceServiceCharges.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      MarketPlaceServiceCharges.countDocuments(filter)
    ]);

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

    logger.info('MarketPlace Service Charges retrieved successfully', { 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, serviceCharges, pagination, 'MarketPlace Service Charges retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving marketplace service charges', { error: error.message, stack: error.stack });
    throw error;
  }
});

/**
 * Get marketplace service charge by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMarketPlaceServiceChargesById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const serviceCharges = await MarketPlaceServiceCharges.findOne({ service_charges_id: parseInt(id) });

    if (!serviceCharges) {
      return sendNotFound(res, 'MarketPlace Service Charges not found');
    }

    logger.info('MarketPlace Service Charges retrieved successfully', { serviceChargesId: serviceCharges._id });

    sendSuccess(res, serviceCharges, 'MarketPlace Service Charges retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving marketplace service charges', { 
      error: error.message, 
      serviceChargesId: req.params.id 
    });
    throw error;
  }
});

/**
 * Update marketplace service charge by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateMarketPlaceServiceCharges = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const serviceCharges = await MarketPlaceServiceCharges.findOneAndUpdate(
      { service_charges_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!serviceCharges) {
      return sendNotFound(res, 'MarketPlace Service Charges not found');
    }

    logger.info('MarketPlace Service Charges updated successfully', { serviceChargesId: serviceCharges._id });

    sendSuccess(res, serviceCharges, 'MarketPlace Service Charges updated successfully');
  } catch (error) {
    logger.error('Error updating marketplace service charges', { error: error.message });
    throw error;
  }
});

/**
 * Delete marketplace service charge by ID (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteMarketPlaceServiceCharges = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const serviceCharges = await MarketPlaceServiceCharges.findOneAndUpdate(
      { service_charges_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!serviceCharges) {
      return sendNotFound(res, 'MarketPlace Service Charges not found');
    }

    logger.info('MarketPlace Service Charges deleted successfully', { serviceChargesId: serviceCharges._id });

    sendSuccess(res, serviceCharges, 'MarketPlace Service Charges deleted successfully');
  } catch (error) {
    logger.error('Error deleting marketplace service charges', { 
      error: error.message, 
      serviceChargesId: req.params.id 
    });
    throw error;
  }
});

/**
 * Get marketplace service charges created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMarketPlaceServiceChargesByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {
      created_by: req.userId
    };

    if (search) {
      filter.service_name = { $regex: search, $options: 'i' };
    }

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [serviceCharges, total] = await Promise.all([
      MarketPlaceServiceCharges.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      MarketPlaceServiceCharges.countDocuments(filter)
    ]);

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

    logger.info('User marketplace service charges retrieved successfully', { 
      userId: req.userId, 
      total, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    sendPaginated(res, serviceCharges, pagination, 'User marketplace service charges retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving user marketplace service charges', { 
      error: error.message, 
      userId: req.userId 
    });
    throw error;
  }
});

module.exports = {
  createMarketPlaceServiceCharges,
  getAllMarketPlaceServiceCharges,
  getMarketPlaceServiceChargesById,
  updateMarketPlaceServiceCharges,
  deleteMarketPlaceServiceCharges,
  getMarketPlaceServiceChargesByAuth
};

