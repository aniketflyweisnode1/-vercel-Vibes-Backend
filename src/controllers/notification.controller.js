const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new notification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createNotification = asyncHandler(async (req, res) => {
  try {
    // Create notification data
    const notificationData = {
      ...req.body,
      created_by: req.userId || null
    };

    // Create notification
    const notification = await Notification.create(notificationData);
    sendSuccess(res, notification, 'Notification created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Create notification by role ID (send to all users with specific role)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createNotificationByRoleId = asyncHandler(async (req, res) => {
  try {
    const { role_id, notification_type_id, notification_txt } = req.body;

    // Find all users with the specified role
    const users = await User.find({ 
      role_id: parseInt(role_id),
      status: true 
    }).select('user_id');

    if (users.length === 0) {
      return sendError(res, 'No users found with the specified role', 404);
    }

    // Create notifications for all users
    const notifications = [];
    for (const user of users) {
      const notificationData = {
        notification_type_id: parseInt(notification_type_id),
        notification_txt,
        user_id: user.user_id,
        created_by: req.userId || null
      };
      
      const notification = await Notification.create(notificationData);
      notifications.push(notification);
    }
    sendSuccess(res, {
      message: `Notifications sent to ${notifications.length} users`,
      notifications: notifications
    }, 'Notifications created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Create notification for all users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createNotificationSendAll = asyncHandler(async (req, res) => {
  try {
    const { notification_type_id, notification_txt } = req.body;

    // Find all active users
    const users = await User.find({ 
      status: true 
    }).select('user_id');

    if (users.length === 0) {
      return sendError(res, 'No active users found', 404);
    }

    // Create notifications for all users
    const notifications = [];
    for (const user of users) {
      const notificationData = {
        notification_type_id: parseInt(notification_type_id),
        notification_txt,
        user_id: user.user_id,
        created_by: req.userId || null
      };
      
      const notification = await Notification.create(notificationData);
      notifications.push(notification);
    }
    sendSuccess(res, {
      message: `Notifications sent to ${notifications.length} users`,
      notifications: notifications
    }, 'Notifications created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all notifications with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllNotifications = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      user_id,
      notification_type_id,
      is_read,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { notification_txt: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = 'true';
    }

    // Add user_id filter
    if (user_id && user_id !== '') {
      filter.user_id = parseInt(user_id);
    }

    // Add notification_type_id filter
    if (notification_type_id && notification_type_id !== '') {
      filter.notification_type_id = parseInt(notification_type_id);
    }

    // Add is_read filter
    if (is_read !== undefined && is_read !== '') {
      filter.is_read = is_read === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(filter)
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
    sendPaginated(res, notifications, pagination, 'Notifications retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get notification by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getNotificationById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({ 
      notification_id: parseInt(id) 
    });

    if (!notification) {
      return sendNotFound(res, 'Notification not found');
    }
    sendSuccess(res, notification, 'Notification retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update notification by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateNotification = asyncHandler(async (req, res) => {
  try {
    const { notification_id, ...updateFields } = req.body;

    // Add update metadata
    const updateData = {
      ...updateFields,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const notification = await Notification.findOneAndUpdate(
      { notification_id: parseInt(notification_id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!notification) {
      return sendNotFound(res, 'Notification not found');
    }
    sendSuccess(res, notification, 'Notification updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete notification by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteNotification = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { notification_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return sendNotFound(res, 'Notification not found');
    }
    sendSuccess(res, notification, 'Notification deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createNotification,
  createNotificationByRoleId,
  createNotificationSendAll,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification
};

