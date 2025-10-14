const FilterVendorLeads = require('../models/filter_vendor_leads.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new filter vendor leads
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createFilterVendorLeads = asyncHandler(async (req, res) => {
  try {
    // Create filter vendor leads data
    const filterVendorLeadsData = {
      ...req.body,
      createdBy: req.userId
    };

    const filterVendorLeads = await FilterVendorLeads.create(filterVendorLeadsData);

    sendSuccess(res, filterVendorLeads, 'Filter vendor leads created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all filter vendor leads with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllFilterVendorLeads = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, vendor_id, platform, product_service_type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { vendor_name: { $regex: search, $options: 'i' } },
        { platform: { $regex: search, $options: 'i' } },
        { product_service_type: { $regex: search, $options: 'i' } },
        { contact_email: { $regex: search, $options: 'i' } }
      ];
    }
  
    if (vendor_id) {
      filter.vendor_id = parseInt(vendor_id);
    }
    if (platform) {
      filter.platform = { $regex: platform, $options: 'i' };
    }
    if (product_service_type) {
      filter.product_service_type = { $regex: product_service_type, $options: 'i' };
    }

    // Get filter vendor leads with pagination
    const [filterVendorLeads, total] = await Promise.all([
      FilterVendorLeads.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      FilterVendorLeads.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, filterVendorLeads, pagination, 'Filter vendor leads retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get filter vendor leads by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFilterVendorLeadsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const filterVendorLeads = await FilterVendorLeads.findOne({ filter_vendor_leads_id: parseInt(id) });

    if (!filterVendorLeads) {
      return sendNotFound(res, 'Filter vendor leads not found');
    }

    sendSuccess(res, filterVendorLeads, 'Filter vendor leads retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get filter vendor leads by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFilterVendorLeadsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, vendor_id, platform, product_service_type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { createdBy: req.userId };
    if (search) {
      filter.$or = [
        { vendor_name: { $regex: search, $options: 'i' } },
        { platform: { $regex: search, $options: 'i' } },
        { product_service_type: { $regex: search, $options: 'i' } },
        { contact_email: { $regex: search, $options: 'i' } }
      ];
    }
  
    if (vendor_id) {
      filter.vendor_id = parseInt(vendor_id);
    }
    if (platform) {
      filter.platform = { $regex: platform, $options: 'i' };
    }
    if (product_service_type) {
      filter.product_service_type = { $regex: product_service_type, $options: 'i' };
    }

    // Get filter vendor leads with pagination
    const [filterVendorLeads, total] = await Promise.all([
      FilterVendorLeads.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      FilterVendorLeads.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, filterVendorLeads, pagination, 'User filter vendor leads retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update filter vendor leads
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateFilterVendorLeads = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    const filterVendorLeads = await FilterVendorLeads.findOneAndUpdate(
      { filter_vendor_leads_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!filterVendorLeads) {
      return sendNotFound(res, 'Filter vendor leads not found');
    }

    sendSuccess(res, filterVendorLeads, 'Filter vendor leads updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete filter vendor leads
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteFilterVendorLeads = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const filterVendorLeads = await FilterVendorLeads.findOneAndDelete({ filter_vendor_leads_id: parseInt(id) });

    if (!filterVendorLeads) {
      return sendNotFound(res, 'Filter vendor leads not found');
    }

    sendSuccess(res, null, 'Filter vendor leads deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createFilterVendorLeads,
  getAllFilterVendorLeads,
  getFilterVendorLeadsById,
  getFilterVendorLeadsByAuth,
  updateFilterVendorLeads,
  deleteFilterVendorLeads
};
