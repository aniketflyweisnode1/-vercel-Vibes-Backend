const Joi = require('joi');

// Validation schema for creating event entry ticket
const createEventEntryTicketSchema = Joi.object({
  event_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0',
    'any.required': 'Event ID is required'
  }),
  title: Joi.string().required().trim().min(1).max(255).messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 1 character long',
    'string.max': 'Title cannot exceed 255 characters',
    'any.required': 'Title is required'
  }),
  price: Joi.number().min(0).required().messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price must be 0 or greater',
    'any.required': 'Price is required'
  }),
  total_seats: Joi.number().integer().min(1).required().messages({
    'number.base': 'Total seats must be a number',
    'number.integer': 'Total seats must be an integer',
    'number.min': 'Total seats must be at least 1',
    'any.required': 'Total seats is required'
  }),
  facility: Joi.array().items(Joi.object()).default([]),
  tag: Joi.string().trim().allow('').messages({
    'string.base': 'Tag must be a string'
  }),
  status: Joi.boolean().default(true)
});

// Validation schema for updating event entry ticket
const updateEventEntryTicketSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  }),
  event_id: Joi.number().integer().min(1).messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0'
  }),
  title: Joi.string().trim().min(1).max(255).messages({
    'string.min': 'Title must be at least 1 character long',
    'string.max': 'Title cannot exceed 255 characters'
  }),
  price: Joi.number().min(0).messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price must be 0 or greater'
  }),
  total_seats: Joi.number().integer().min(1).messages({
    'number.base': 'Total seats must be a number',
    'number.integer': 'Total seats must be an integer',
    'number.min': 'Total seats must be at least 1'
  }),
  facility: Joi.array().items(Joi.object()),
  tag: Joi.string().trim().allow(''),
  status: Joi.boolean()
}).min(2).messages({
  'object.min': 'At least one field must be provided for update (excluding ID)'
});

// Validation schema for query parameters
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(255).allow(''),
  status: Joi.string().valid('true', 'false').allow(''),
  event_id: Joi.number().integer().min(1).allow('').messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0'
  })
});

// Validation schema for ID parameter
const idSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  })
});

module.exports = {
  createEventEntryTicketSchema,
  updateEventEntryTicketSchema,
  querySchema,
  idSchema
};

