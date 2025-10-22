const LeadContacted = require('../models/lead_contacted.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new lead contacted
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createLeadContacted = asyncHandler(async (req, res) => {
  try {
    // Create lead contacted data
    const leadData = {
      ...req.body,
      created_by: req.userId
    };

    // Create lead contacted
    const lead = await LeadContacted.create(leadData);
    sendSuccess(res, lead, 'Lead contacted created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all lead contacted with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllLeadContacted = asyncHandler(async (req, res) => {
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
    const [leads, total] = await Promise.all([
      LeadContacted.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      LeadContacted.countDocuments(filter)
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
    sendPaginated(res, leads, pagination, 'Lead contacted retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get lead contacted by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLeadContactedById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await LeadContacted.findOne({ 
      Lead_Contacted_id: parseInt(id) 
    });

    if (!lead) {
      return sendNotFound(res, 'Lead contacted not found');
    }
    sendSuccess(res, lead, 'Lead contacted retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update lead contacted by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateLeadContacted = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const lead = await LeadContacted.findOneAndUpdate(
      { Lead_Contacted_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!lead) {
      return sendNotFound(res, 'Lead contacted not found');
    }
    sendSuccess(res, lead, 'Lead contacted updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update lead contacted by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateLeadContactedByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const lead = await LeadContacted.findOneAndUpdate(
      { Lead_Contacted_id: parseInt(id) },
      finalUpdateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!lead) {
      return sendNotFound(res, 'Lead contacted not found');
    }
    sendSuccess(res, lead, 'Lead contacted updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete lead contacted by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteLeadContacted = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await LeadContacted.findOneAndUpdate(
      { Lead_Contacted_id: parseInt(id) },
      { 
        Status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!lead) {
      return sendNotFound(res, 'Lead contacted not found');
    }
    sendSuccess(res, lead, 'Lead contacted deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createLeadContacted,
  getAllLeadContacted,
  getLeadContactedById,
  updateLeadContacted,
  updateLeadContactedByIdBody,
  deleteLeadContacted
};
