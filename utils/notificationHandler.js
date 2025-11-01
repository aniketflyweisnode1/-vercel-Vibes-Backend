const Notification = require('../src/models/notification.model');

/**
 * Notification handler utility functions
 */

/**
 * Handler function to create a notification
 * This can be used across different controllers to send notifications
 * @param {Number} userId - User ID who will receive the notification
 * @param {Number} notificationTypeId - Notification type ID
 * @param {String} notificationText - Notification text/message
 * @param {Number} createdBy - User ID who created the notification (optional)
 * @returns {Promise<Object>} Created notification object
 */
const createNotificationHendlar = async (userId, notificationTypeId, notificationText, createdBy = null) => {
  try {
    const notificationData = {
      user_id: userId,
      notification_type_id: notificationTypeId,
      notification_txt: notificationText,
      created_by: createdBy,
      is_read: false,
      status: true
    };

    const notification = await Notification.create(notificationData);
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Return null instead of throwing to prevent breaking the main flow
    return null;
  }
};

/**
 * Handler function to create notifications for multiple users
 * @param {Array<Number>} userIds - Array of user IDs
 * @param {Number} notificationTypeId - Notification type ID
 * @param {String} notificationText - Notification text/message
 * @param {Number} createdBy - User ID who created the notification (optional)
 * @returns {Promise<Array>} Array of created notifications
 */
const createNotificationsForUsers = async (userIds, notificationTypeId, notificationText, createdBy = null) => {
  try {
    const notifications = [];
    for (const userId of userIds) {
      const notification = await createNotificationHendlar(userId, notificationTypeId, notificationText, createdBy);
      if (notification) {
        notifications.push(notification);
      }
    }
    return notifications;
  } catch (error) {
    console.error('Failed to create notifications for users:', error);
    return [];
  }
};

module.exports = {
  createNotificationHendlar,
  createNotificationsForUsers
};

