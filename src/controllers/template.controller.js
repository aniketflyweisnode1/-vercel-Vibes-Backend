const Template = require('../models/template');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const createTemplate = asyncHandler(async (req, res) => {
  try {
    // Create Template data
    const TemplateData = {
      ...req.body,
      user_id: req.userId
    };

    // Create Template
    const Template1 = await Template.create(TemplateData);

    sendSuccess(res, Template1, 'Template created successfully', 201);
  } catch (error) {
    throw error;
  }
});
const getAllTemplate = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { user_id: req.userId };
    if (search) {
      filter.$or = [
        { Template_name: { $regex: search, $options: 'i' } },
      ];
    }
    const [Template1, total] = await Promise.all([
      Template.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Template.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, Template1, pagination, 'Template retrieved successfully');
  } catch (error) {
    throw error;
  }
});
const getTemplateById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const Template1 = await Template.findOne({ template_id: parseInt(id) });

    if (!Template1) {
      return sendNotFound(res, 'Template not found');
    }

    sendSuccess(res, Template1, 'Template retrieved successfully');
  } catch (error) {
    throw error;
  }
});
const updateTemplate = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    const Template1 = await Template.findOneAndUpdate(
      { template_id: parseInt(id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!Template) {
      return sendNotFound(res, 'Template not found');
    }

    sendSuccess(res, Template1, 'Template updated successfully');
  } catch (error) {
    throw error;
  }
});
const deleteTemplate = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const Template1 = await Template.findOneAndDelete({ template_id: parseInt(id) });

    if (!Template1) {
      return sendNotFound(res, 'Template not found');
    }

    sendSuccess(res, null, 'Template deleted successfully');
  } catch (error) {
    throw error;
  }
});
module.exports = {
  createTemplate,
  getAllTemplate,
  getTemplateById,
  updateTemplate,
  deleteTemplate
};
