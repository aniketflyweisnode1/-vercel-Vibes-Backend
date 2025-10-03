const Joi = require('joi');

// Create ticket reply validation schema
const createTicketReplySchema = Joi.object({
  ticket_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Ticket ID must be a number',
      'number.integer': 'Ticket ID must be an integer',
      'number.positive': 'Ticket ID must be a positive number',
      'any.required': 'Ticket ID is required'
    }),
  reply: Joi.string().max(2000).required()
    .messages({
      'string.base': 'Reply must be a string',
      'string.max': 'Reply cannot exceed 2000 characters',
      'any.required': 'Reply is required'
    }),
  status: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update all ticket replies validation schema
const updateAllTicketRepliesSchema = Joi.object({
  ticket_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Ticket ID must be a number',
      'number.integer': 'Ticket ID must be an integer',
      'number.positive': 'Ticket ID must be a positive number',
      'any.required': 'Ticket ID is required'
    })
});

// Update ticket reply validation schema
const updateTicketReplySchema = Joi.object({
  ticket_replys_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Ticket reply ID must be a number',
      'number.integer': 'Ticket reply ID must be an integer',
      'number.positive': 'Ticket reply ID must be a positive number',
      'any.required': 'Ticket reply ID is required'
    }),
  ticket_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Ticket ID must be a number',
      'number.integer': 'Ticket ID must be an integer',
      'number.positive': 'Ticket ID must be a positive number'
    }),
  reply: Joi.string().max(2000).optional()
    .messages({
      'string.base': 'Reply must be a string',
      'string.max': 'Reply cannot exceed 2000 characters'
    }),
  reply_by_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Reply by ID must be a number',
      'number.integer': 'Reply by ID must be an integer',
      'number.positive': 'Reply by ID must be a positive number'
    }),
  status: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Get ticket reply by ID validation schema
const getTicketReplyByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer',
      'number.positive': 'ID must be a positive number',
      'any.required': 'ID is required'
    })
});

// Get all ticket replies query validation schema
const getAllTicketRepliesSchema = Joi.object({
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
  ticket_id: Joi.number().integer().positive().allow('').optional()
    .messages({
      'number.base': 'Ticket ID must be a number',
      'number.integer': 'Ticket ID must be an integer',
      'number.positive': 'Ticket ID must be a positive number'
    }),
  reply_by_id: Joi.number().integer().positive().allow('').optional()
    .messages({
      'number.base': 'Reply by ID must be a number',
      'number.integer': 'Reply by ID must be an integer',
      'number.positive': 'Reply by ID must be a positive number'
    }),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'ticket_replys_id', 'ticket_id').optional()
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, ticket_replys_id, ticket_id'
    }),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"'
    })
});

module.exports = {
  createTicketReplySchema,
  updateAllTicketRepliesSchema,
  updateTicketReplySchema,
  getTicketReplyByIdSchema,
  getAllTicketRepliesSchema
};
