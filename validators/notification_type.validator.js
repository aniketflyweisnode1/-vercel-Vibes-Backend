const Joi = require('joi');

// Create notification type validation schema
const createNotificationTypeSchema = Joi.object({
  notification_type: Joi.string().max(100).required()
    .messages({
      'string.base': 'Notification type must be a string',
      'string.max': 'Notification type cannot exceed 100 characters',
      'any.required': 'Notification type is required'
    }),
  emoji: Joi.string().max(10).optional()
    .messages({
      'string.max': 'Emoji cannot exceed 10 characters'
    }),
  status: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update notification type validation schema
const updateNotificationTypeSchema = Joi.object({
  notification_type_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Notification type ID must be a number',
      'number.integer': 'Notification type ID must be an integer',
      'number.positive': 'Notification type ID must be a positive number',
      'any.required': 'Notification type ID is required'
    }),
  notification_type: Joi.string().max(100).optional()
    .messages({
      'string.base': 'Notification type must be a string',
      'string.max': 'Notification type cannot exceed 100 characters'
    }),
  emoji: Joi.string().max(10).optional()
    .messages({
      'string.max': 'Emoji cannot exceed 10 characters'
    }),
  status: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Get notification type by ID validation schema
const getNotificationTypeByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer',
      'number.positive': 'ID must be a positive number',
      'any.required': 'ID is required'
    })
});

// Get all notification types query validation schema
const getAllNotificationTypesSchema = Joi.object({
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
  sortBy: Joi.string().valid('created_at', 'updated_at', 'notification_type', 'notification_type_id').optional()
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, notification_type, notification_type_id'
    }),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"'
    })
});

module.exports = {
  createNotificationTypeSchema,
  updateNotificationTypeSchema,
  getNotificationTypeByIdSchema,
  getAllNotificationTypesSchema
};
