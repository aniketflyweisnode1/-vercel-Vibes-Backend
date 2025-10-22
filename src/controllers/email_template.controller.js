const EmailTemplate = require('../models/email_template.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new email template
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEmailTemplate = asyncHandler(async (req, res) => {
  try {
    // Create email template data
    const templateData = {
      ...req.body,
      created_by: req.userId
    };

    // Create email template
    const template = await EmailTemplate.create(templateData);
    sendSuccess(res, template, 'Email template created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all email templates with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEmailTemplate = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      vendor_id,
      defultTemplate,
      Status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { Title: { $regex: search, $options: 'i' } },
        { Subject: { $regex: search, $options: 'i' } },
        { subTitle: { $regex: search, $options: 'i' } },
        { Preview: { $regex: search, $options: 'i' } }
      ];
    }

    // Add vendor_id filter
    if (vendor_id) {
      filter.vendor_id = parseInt(vendor_id);
    }

    // Add defultTemplate filter
    if (defultTemplate !== undefined) {
      filter.defultTemplate = defultTemplate === 'true';
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
    const [templates, total] = await Promise.all([
      EmailTemplate.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      EmailTemplate.countDocuments(filter)
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
    sendPaginated(res, templates, pagination, 'Email templates retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get email template by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEmailTemplateById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const template = await EmailTemplate.findOne({ 
      EmailTemplate_id: parseInt(id) 
    });

    if (!template) {
      return sendNotFound(res, 'Email template not found');
    }
    sendSuccess(res, template, 'Email template retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update email template by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEmailTemplate = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const template = await EmailTemplate.findOneAndUpdate(
      { EmailTemplate_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!template) {
      return sendNotFound(res, 'Email template not found');
    }
    sendSuccess(res, template, 'Email template updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update email template by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEmailTemplateByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const template = await EmailTemplate.findOneAndUpdate(
      { EmailTemplate_id: parseInt(id) },
      finalUpdateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!template) {
      return sendNotFound(res, 'Email template not found');
    }
    sendSuccess(res, template, 'Email template updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete email template by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEmailTemplate = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const template = await EmailTemplate.findOneAndUpdate(
      { EmailTemplate_id: parseInt(id) },
      { 
        Status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!template) {
      return sendNotFound(res, 'Email template not found');
    }
    sendSuccess(res, template, 'Email template deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createEmailTemplate,
  getAllEmailTemplate,
  getEmailTemplateById,
  updateEmailTemplate,
  updateEmailTemplateByIdBody,
  deleteEmailTemplate
};
