const VendorLeads = require('../models/vendor_leads.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new vendor lead
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVendorLead = asyncHandler(async (req, res) => {
  try {
    // Create vendor lead data
    const leadData = {
      ...req.body,
      created_by: req.userId
    };

    // Create vendor lead
    const lead = await VendorLeads.create(leadData);
    sendSuccess(res, lead, 'Vendor lead created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all vendor leads with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVendorLeads = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      LeadStatus,
      Status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { Vendor_name: { $regex: search, $options: 'i' } },
        { ContactEmail: { $regex: search, $options: 'i' } },
        { product_serviceType: { $regex: search, $options: 'i' } },
        { platform: { $regex: search, $options: 'i' } }
      ];
    }

    // Add LeadStatus filter
    if (LeadStatus) {
      filter.LeadStatus = LeadStatus;
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
    const [leads, total] = await Promise.all([
      VendorLeads.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      VendorLeads.countDocuments(filter)
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
    sendPaginated(res, leads, pagination, 'Vendor leads retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vendor lead by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVendorLeadById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await VendorLeads.findOne({ 
      Vendor_Leads_id: parseInt(id) 
    });

    if (!lead) {
      return sendNotFound(res, 'Vendor lead not found');
    }
    sendSuccess(res, lead, 'Vendor lead retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vendor leads by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVendorLeadsByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      LeadStatus,
      Status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {
      created_by: req.userId
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { Vendor_name: { $regex: search, $options: 'i' } },
        { ContactEmail: { $regex: search, $options: 'i' } },
        { product_serviceType: { $regex: search, $options: 'i' } },
        { platform: { $regex: search, $options: 'i' } }
      ];
    }

    // Add LeadStatus filter
    if (LeadStatus) {
      filter.LeadStatus = LeadStatus;
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
    const [leads, total] = await Promise.all([
      VendorLeads.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      VendorLeads.countDocuments(filter)
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
    sendPaginated(res, leads, pagination, 'Vendor leads retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vendor lead by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVendorLead = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const lead = await VendorLeads.findOneAndUpdate(
      { Vendor_Leads_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!lead) {
      return sendNotFound(res, 'Vendor lead not found');
    }
    sendSuccess(res, lead, 'Vendor lead updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vendor lead by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVendorLeadByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const lead = await VendorLeads.findOneAndUpdate(
      { Vendor_Leads_id: parseInt(id) },
      finalUpdateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!lead) {
      return sendNotFound(res, 'Vendor lead not found');
    }
    sendSuccess(res, lead, 'Vendor lead updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete vendor lead by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVendorLead = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await VendorLeads.findOneAndUpdate(
      { Vendor_Leads_id: parseInt(id) },
      { 
        Status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!lead) {
      return sendNotFound(res, 'Vendor lead not found');
    }
    sendSuccess(res, lead, 'Vendor lead deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createVendorLead,
  getAllVendorLeads,
  getVendorLeadById,
  getVendorLeadsByAuth,
  updateVendorLead,
  updateVendorLeadByIdBody,
  deleteVendorLead
};
