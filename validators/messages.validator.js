const Joi = require('joi');

// Create message validation schema
const createMessageSchema = Joi.object({
  sender_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Sender ID must be a number',
      'number.integer': 'Sender ID must be an integer',
      'number.positive': 'Sender ID must be a positive number',
      'any.required': 'Sender ID is required'
    }),
  receiver_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Receiver ID must be a number',
      'number.integer': 'Receiver ID must be an integer',
      'number.positive': 'Receiver ID must be a positive number',
      'any.required': 'Receiver ID is required'
    }),
  messages_txt: Joi.string().trim().max(1000).required()
    .messages({
      'string.base': 'Messages text must be a string',
      'string.empty': 'Messages text cannot be empty',
      'string.max': 'Messages text cannot exceed 1000 characters',
      'any.required': 'Messages text is required'
    }),
  image: Joi.string().max(500).optional().allow('')
    .messages({
      'string.max': 'Image path cannot exceed 500 characters'
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

// Update message validation schema
const updateMessageSchema = Joi.object({
  messages_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Messages ID must be a number',
      'number.integer': 'Messages ID must be an integer',
      'number.positive': 'Messages ID must be a positive number',
      'any.required': 'Messages ID is required'
    }),
  sender_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Sender ID must be a number',
      'number.integer': 'Sender ID must be an integer',
      'number.positive': 'Sender ID must be a positive number'
    }),
  receiver_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Receiver ID must be a number',
      'number.integer': 'Receiver ID must be an integer',
      'number.positive': 'Receiver ID must be a positive number'
    }),
  messages_txt: Joi.string().max(1000).optional()
    .messages({
      'string.base': 'Messages text must be a string',
      'string.max': 'Messages text cannot exceed 1000 characters'
    }),
  image: Joi.string().max(500).optional().allow('')
    .messages({
      'string.max': 'Image path cannot exceed 500 characters'
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

// Get message by ID validation schema
const getMessageByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer',
      'number.positive': 'ID must be a positive number',
      'any.required': 'ID is required'
    })
});

// Get all messages query validation schema
const getAllMessagesSchema = Joi.object({
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
  sortBy: Joi.string().valid('created_at', 'updated_at', 'messages_txt', 'messages_id').optional()
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, messages_txt, messages_id'
    }),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"'
    })
});

module.exports = {
  createMessageSchema,
  updateMessageSchema,
  getMessageByIdSchema,
  getAllMessagesSchema
};
