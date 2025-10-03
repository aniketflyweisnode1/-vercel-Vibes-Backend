const Joi = require('joi');

// Create ticket type validation schema
const createTicketTypeSchema = Joi.object({
  ticket_type: Joi.string().max(100).required()
    .messages({
      'string.base': 'Ticket type must be a string',
      'string.max': 'Ticket type cannot exceed 100 characters',
      'any.required': 'Ticket type is required'
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

// Update ticket type validation schema
const updateTicketTypeSchema = Joi.object({
  ticket_type_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Ticket type ID must be a number',
      'number.integer': 'Ticket type ID must be an integer',
      'number.positive': 'Ticket type ID must be a positive number',
      'any.required': 'Ticket type ID is required'
    }),
  ticket_type: Joi.string().max(100).optional()
    .messages({
      'string.base': 'Ticket type must be a string',
      'string.max': 'Ticket type cannot exceed 100 characters'
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

// Get ticket type by ID validation schema
const getTicketTypeByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer',
      'number.positive': 'ID must be a positive number',
      'any.required': 'ID is required'
    })
});

// Get all ticket types query validation schema
const getAllTicketTypesSchema = Joi.object({
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
  sortBy: Joi.string().valid('created_at', 'updated_at', 'ticket_type', 'ticket_type_id').optional()
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, ticket_type, ticket_type_id'
    }),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"'
    })
});

module.exports = {
  createTicketTypeSchema,
  updateTicketTypeSchema,
  getTicketTypeByIdSchema,
  getAllTicketTypesSchema
};
