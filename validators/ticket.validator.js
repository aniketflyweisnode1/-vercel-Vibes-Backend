const Joi = require('joi');

// Create ticket validation schema
const createTicketSchema = Joi.object({
  ticket_type_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Ticket type ID must be a number',
      'number.integer': 'Ticket type ID must be an integer',
      'number.positive': 'Ticket type ID must be a positive number',
      'any.required': 'Ticket type ID is required'
    }),
  ticket_query: Joi.string().max(2000).required()
    .messages({
      'string.base': 'Ticket query must be a string',
      'string.max': 'Ticket query cannot exceed 2000 characters',
      'any.required': 'Ticket query is required'
    }),
  reply: Joi.string().max(2000).optional()
    .messages({
      'string.max': 'Reply cannot exceed 2000 characters'
    }),
  status: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update ticket validation schema
const updateTicketSchema = Joi.object({
  ticket_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Ticket ID must be a number',
      'number.integer': 'Ticket ID must be an integer',
      'number.positive': 'Ticket ID must be a positive number',
      'any.required': 'Ticket ID is required'
    }),
  ticket_type_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Ticket type ID must be a number',
      'number.integer': 'Ticket type ID must be an integer',
      'number.positive': 'Ticket type ID must be a positive number'
    }),
  ticket_query: Joi.string().max(2000).optional()
    .messages({
      'string.base': 'Ticket query must be a string',
      'string.max': 'Ticket query cannot exceed 2000 characters'
    }),
  reply: Joi.string().max(2000).optional()
    .messages({
      'string.max': 'Reply cannot exceed 2000 characters'
    }),
  status: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Get ticket by ID validation schema
const getTicketByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer',
      'number.positive': 'ID must be a positive number',
      'any.required': 'ID is required'
    })
});

// Get ticket by ticket type validation schema
const getTicketByTicketTypeSchema = Joi.object({
  ticketTypeId: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Ticket type ID must be a number',
      'number.integer': 'Ticket type ID must be an integer',
      'number.positive': 'Ticket type ID must be a positive number',
      'any.required': 'Ticket type ID is required'
    })
});

// Get all tickets query validation schema
const getAllTicketsSchema = Joi.object({
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
  ticket_type_id: Joi.number().integer().positive().allow('').optional()
    .messages({
      'number.base': 'Ticket type ID must be a number',
      'number.integer': 'Ticket type ID must be an integer',
      'number.positive': 'Ticket type ID must be a positive number'
    }),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'ticket_id', 'ticket_type_id').optional()
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, ticket_id, ticket_type_id'
    }),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"'
    })
});

module.exports = {
  createTicketSchema,
  updateTicketSchema,
  getTicketByIdSchema,
  getTicketByTicketTypeSchema,
  getAllTicketsSchema
};
