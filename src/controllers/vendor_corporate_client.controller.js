const VendorCorporateClient = require('../models/vendor_corporate_client.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new vendor corporate client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVendorCorporateClient = asyncHandler(async (req, res) => {
  try {
    // Create vendor corporate client data
    const vendorCorporateClientData = {
      ...req.body,
      createdBy: req.userId
    };

    const vendorCorporateClient = await VendorCorporateClient.create(vendorCorporateClientData);

    sendSuccess(res, vendorCorporateClient, 'Vendor corporate client created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all vendor corporate clients with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVendorCorporateClients = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, vendor_id, industry } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { company_name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { contact_email: { $regex: search, $options: 'i' } }
      ];
    }
  
    if (vendor_id) {
      filter.vendor_id = parseInt(vendor_id);
    }
    if (industry) {
      filter.industry = { $regex: industry, $options: 'i' };
    }

    // Get vendor corporate clients with pagination
    const [vendorCorporateClients, total] = await Promise.all([
      VendorCorporateClient.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VendorCorporateClient.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, vendorCorporateClients, pagination, 'Vendor corporate clients retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vendor corporate client by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVendorCorporateClientById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const vendorCorporateClient = await VendorCorporateClient.findOne({ vendor_corporate_client_id: parseInt(id) });

    if (!vendorCorporateClient) {
      return sendNotFound(res, 'Vendor corporate client not found');
    }

    sendSuccess(res, vendorCorporateClient, 'Vendor corporate client retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vendor corporate clients by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVendorCorporateClientsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, vendor_id, industry } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { createdBy: req.userId };
    if (search) {
      filter.$or = [
        { company_name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { contact_email: { $regex: search, $options: 'i' } }
      ];
    }
  
    if (vendor_id) {
      filter.vendor_id = parseInt(vendor_id);
    }
    if (industry) {
      filter.industry = { $regex: industry, $options: 'i' };
    }

    // Get vendor corporate clients with pagination
    const [vendorCorporateClients, total] = await Promise.all([
      VendorCorporateClient.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VendorCorporateClient.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, vendorCorporateClients, pagination, 'User vendor corporate clients retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vendor corporate client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVendorCorporateClient = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    const vendorCorporateClient = await VendorCorporateClient.findOneAndUpdate(
      { vendor_corporate_client_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!vendorCorporateClient) {
      return sendNotFound(res, 'Vendor corporate client not found');
    }

    sendSuccess(res, vendorCorporateClient, 'Vendor corporate client updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete vendor corporate client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVendorCorporateClient = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const vendorCorporateClient = await VendorCorporateClient.findOneAndDelete({ vendor_corporate_client_id: parseInt(id) });

    if (!vendorCorporateClient) {
      return sendNotFound(res, 'Vendor corporate client not found');
    }

    sendSuccess(res, null, 'Vendor corporate client deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createVendorCorporateClient,
  getAllVendorCorporateClients,
  getVendorCorporateClientById,
  getVendorCorporateClientsByAuth,
  updateVendorCorporateClient,
  deleteVendorCorporateClient
};
