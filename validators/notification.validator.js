const Joi = require('joi');

// Create notification validation schema
const createNotificationSchema = Joi.object({
  notification_type_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Notification type ID must be a number',
      'number.integer': 'Notification type ID must be an integer',
      'number.positive': 'Notification type ID must be a positive number',
      'any.required': 'Notification type ID is required'
    }),
  notification_txt: Joi.string().max(500).required()
    .messages({
      'string.base': 'Notification text must be a string',
      'string.max': 'Notification text cannot exceed 500 characters',
      'any.required': 'Notification text is required'
    }),
  user_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number',
      'any.required': 'User ID is required'
    }),
  is_read: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Is read must be a boolean value'
    }),
  status: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Create notification by role ID validation schema
const createNotificationByRoleIdSchema = Joi.object({
  role_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Role ID must be a number',
      'number.integer': 'Role ID must be an integer',
      'number.positive': 'Role ID must be a positive number',
      'any.required': 'Role ID is required'
    }),
  notification_type_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Notification type ID must be a number',
      'number.integer': 'Notification type ID must be an integer',
      'number.positive': 'Notification type ID must be a positive number',
      'any.required': 'Notification type ID is required'
    }),
  notification_txt: Joi.string().max(500).required()
    .messages({
      'string.base': 'Notification text must be a string',
      'string.max': 'Notification text cannot exceed 500 characters',
      'any.required': 'Notification text is required'
    })
});

// Create notification send all validation schema
const createNotificationSendAllSchema = Joi.object({
  notification_type_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Notification type ID must be a number',
      'number.integer': 'Notification type ID must be an integer',
      'number.positive': 'Notification type ID must be a positive number',
      'any.required': 'Notification type ID is required'
    }),
  notification_txt: Joi.string().max(500).required()
    .messages({
      'string.base': 'Notification text must be a string',
      'string.max': 'Notification text cannot exceed 500 characters',
      'any.required': 'Notification text is required'
    })
});

// Update notification validation schema
const updateNotificationSchema = Joi.object({
  notification_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Notification ID must be a number',
      'number.integer': 'Notification ID must be an integer',
      'number.positive': 'Notification ID must be a positive number',
      'any.required': 'Notification ID is required'
    }),
  notification_type_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Notification type ID must be a number',
      'number.integer': 'Notification type ID must be an integer',
      'number.positive': 'Notification type ID must be a positive number'
    }),
  notification_txt: Joi.string().max(500).optional()
    .messages({
      'string.base': 'Notification text must be a string',
      'string.max': 'Notification text cannot exceed 500 characters'
    }),
  user_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),
  is_read: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Is read must be a boolean value'
    }),
  status: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Get notification by ID validation schema
const getNotificationByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer',
      'number.positive': 'ID must be a positive number',
      'any.required': 'ID is required'
    })
});

// Get all notifications query validation schema
const getAllNotificationsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional()
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number().integer().min(1).max(100).optional()
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string().max(100).allow('').optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  status: Joi.string().valid('true', 'false').optional()
    .messages({
      'any.only': 'Status must be either "true" or "false"'
    }),
  user_id: Joi.number().integer().positive().allow('').optional()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),
  notification_type_id: Joi.number().integer().positive().allow('').optional()
    .messages({
      'number.base': 'Notification type ID must be a number',
      'number.integer': 'Notification type ID must be an integer',
      'number.positive': 'Notification type ID must be a positive number'
    }),
  is_read: Joi.string().valid('true', 'false').allow('').optional()
    .messages({
      'any.only': 'Is read must be either "true" or "false"'
    }),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'notification_id', 'user_id').optional()
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, notification_id, user_id'
    }),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"'
    })
});

module.exports = {
  createNotificationSchema,
  createNotificationByRoleIdSchema,
  createNotificationSendAllSchema,
  updateNotificationSchema,
  getNotificationByIdSchema,
  getAllNotificationsSchema
};
