const ContactVendor = require('../models/contact_vendor.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { createNotificationHendlar } = require('../../utils/notificationHandler');

/**
 * Create a new contact vendor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createContactVendor = asyncHandler(async (req, res) => {
  try {
    // Create contact vendor data
    const contactVendorData = {
      ...req.body,
      user_id: req.body.user_id || req.userId,
      createdBy: req.userId
    };

    // Create contact vendor
    const contactVendor = await ContactVendor.create(contactVendorData);

    // Create notification for contact vendor creation
    try {
      if (req.userId) {
        await createNotificationHendlar(
          contactVendorData.user_id || req.userId,
          3, // Notification type ID: 3 = Contact related
          `You have successfully contacted a vendor regarding your event.`,
          req.userId
        );
      }
    } catch (notificationError) {
      console.error('Failed to create contact vendor notification:', notificationError);
    }

    sendSuccess(res, contactVendor, 'Contact vendor created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all contact vendors with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllContactVendors = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, vendor_id, user_id, event_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { topic: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== undefined && status !== '') {
      filter.status = status === 'true';
    }
    if (vendor_id) {
      filter.vendor_id = parseInt(vendor_id);
    }
    if (user_id) {
      filter.user_id = parseInt(user_id);
    }
    if (event_id) {
      filter.event_id = parseInt(event_id);
    }

    // Get contact vendors with pagination
    const [contactVendors, total] = await Promise.all([
      ContactVendor.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ContactVendor.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, contactVendors, pagination, 'Contact vendors retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get contact vendor by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getContactVendorById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const contactVendor = await ContactVendor.findOne({ contact_vendor_id: parseInt(id) });

    if (!contactVendor) {
      return sendNotFound(res, 'Contact vendor not found');
    }

    sendSuccess(res, contactVendor, 'Contact vendor retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update contact vendor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateContactVendor = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;
    req.body.updatedAt = new Date();

    // Remove id from req.body before updating
    const { id: _, ...updateData } = req.body;

    const contactVendor = await ContactVendor.findOneAndUpdate(
      { contact_vendor_id: parseInt(id) },
      updateData,
      { new: true, runValidators: true }
    );

    if (!contactVendor) {
      return sendNotFound(res, 'Contact vendor not found');
    }

    // Create notification for contact vendor update
    try {
      if (req.userId) {
        await createNotificationHendlar(
          contactVendor.user_id || req.userId,
          3, // Notification type ID: 3 = Contact related
          `Your contact vendor information has been updated successfully.`,
          req.userId
        );
      }
    } catch (notificationError) {
      console.error('Failed to create contact vendor update notification:', notificationError);
    }

    sendSuccess(res, contactVendor, 'Contact vendor updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete contact vendor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteContactVendor = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const contactVendor = await ContactVendor.findOneAndDelete({ contact_vendor_id: parseInt(id) });

    if (!contactVendor) {
      return sendNotFound(res, 'Contact vendor not found');
    }

    // Create notification for contact vendor deletion
    try {
      if (req.userId && contactVendor.user_id) {
        await createNotificationHendlar(
          contactVendor.user_id,
          3, // Notification type ID: 3 = Contact related
          `Your contact vendor record has been deleted successfully.`,
          req.userId
        );
      }
    } catch (notificationError) {
      console.error('Failed to create contact vendor deletion notification:', notificationError);
    }

    sendSuccess(res, null, 'Contact vendor deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createContactVendor,
  getAllContactVendors,
  getContactVendorById,
  updateContactVendor,
  deleteContactVendor
};

