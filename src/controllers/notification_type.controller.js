const NotificationType = require('../models/notification_type.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new notification type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createNotificationType = asyncHandler(async (req, res) => {
  try {
    // Create notification type data
    const notificationTypeData = {
      ...req.body,
      created_by: req.userId || null
    };

    // Create notification type
    const notificationType = await NotificationType.create(notificationTypeData);
    sendSuccess(res, notificationType, 'Notification type created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all notification types with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllNotificationTypes = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { notification_type: { $regex: search, $options: 'i' } },
        { emoji: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [notificationTypes, total] = await Promise.all([
      NotificationType.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      NotificationType.countDocuments(filter)
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
    sendPaginated(res, notificationTypes, pagination, 'Notification types retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get notification type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getNotificationTypeById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const notificationType = await NotificationType.findOne({ 
      notification_type_id: parseInt(id) 
    });

    if (!notificationType) {
      return sendNotFound(res, 'Notification type not found');
    }
    sendSuccess(res, notificationType, 'Notification type retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get notification type by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getNotificationTypeByAuth = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;

    // Get notification types created by the authenticated user
    const notificationTypes = await NotificationType.find({ 
      created_by: userId 
    }).sort({ created_at: -1 });
    sendSuccess(res, notificationTypes, 'Notification types retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update notification type by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateNotificationType = asyncHandler(async (req, res) => {
  try {
    const { notification_type_id, ...updateFields } = req.body;

    // Add update metadata
    const updateData = {
      ...updateFields,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const notificationType = await NotificationType.findOneAndUpdate(
      { notification_type_id: parseInt(notification_type_id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!notificationType) {
      return sendNotFound(res, 'Notification type not found');
    }
    sendSuccess(res, notificationType, 'Notification type updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete notification type by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteNotificationType = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const notificationType = await NotificationType.findOneAndUpdate(
      { notification_type_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!notificationType) {
      return sendNotFound(res, 'Notification type not found');
    }
    sendSuccess(res, notificationType, 'Notification type deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createNotificationType,
  getAllNotificationTypes,
  getNotificationTypeById,
  getNotificationTypeByAuth,
  updateNotificationType,
  deleteNotificationType
};

