const Joi = require('joi');

// Validation schema for creating guest
const createGuestSchema = Joi.object({
  role_id: Joi.string().required().trim().min(1).max(255).messages({
    'string.empty': 'Guest name is required',
    'string.min': 'Guest name must be at least 1 character long',
    'string.max': 'Guest name cannot exceed 255 characters',
    'any.required': 'Guest name is required'
  }),
  name: Joi.string().required().trim().min(1).max(255).messages({
    'string.empty': 'Guest name is required',
    'string.min': 'Guest name must be at least 1 character long',
    'string.max': 'Guest name cannot exceed 255 characters',
    'any.required': 'Guest name is required'
  }),
  mobileno: Joi.string().required().trim().min(10).max(15).pattern(/^[+]?[\d\s\-\(\)]+$/).messages({
    'string.empty': 'Mobile number is required',
    'string.min': 'Mobile number must be at least 10 characters long',
    'string.max': 'Mobile number cannot exceed 15 characters',
    'string.pattern.base': 'Mobile number must contain only digits, spaces, hyphens, parentheses, and optional + sign',
    'any.required': 'Mobile number is required'
  }),
  email: Joi.string().required().trim().email().lowercase().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  }),
  specialnote: Joi.string().trim().max(1000).allow('').messages({
    'string.max': 'Special note cannot exceed 1000 characters'
  }),
  img: Joi.string().trim().uri().allow('').messages({
    'string.uri': 'Image must be a valid URL'
  }),
  event_id: Joi.number().integer().min(1).allow(null).messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0'
  }),
  status: Joi.boolean().default(true)
});

// Validation schema for updating guest
const updateGuestSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  }),
  role_id: Joi.string().required().trim().min(1).max(255).messages({
    'string.empty': 'Guest name is required',
    'string.min': 'Guest name must be at least 1 character long',
    'string.max': 'Guest name cannot exceed 255 characters',
    'any.required': 'Guest name is required'
  }),
  name: Joi.string().trim().min(1).max(255).messages({
    'string.min': 'Guest name must be at least 1 character long',
    'string.max': 'Guest name cannot exceed 255 characters'
  }),
  mobileno: Joi.string().trim().min(10).max(15).pattern(/^[+]?[\d\s\-\(\)]+$/).messages({
    'string.min': 'Mobile number must be at least 10 characters long',
    'string.max': 'Mobile number cannot exceed 15 characters',
    'string.pattern.base': 'Mobile number must contain only digits, spaces, hyphens, parentheses, and optional + sign'
  }),
  email: Joi.string().trim().email().lowercase().messages({
    'string.email': 'Email must be a valid email address'
  }),
  specialnote: Joi.string().trim().max(1000).allow('').messages({
    'string.max': 'Special note cannot exceed 1000 characters'
  }),
  img: Joi.string().trim().uri().allow('').messages({
    'string.uri': 'Image must be a valid URL'
  }),
  event_id: Joi.number().integer().min(1).allow(null).messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0'
  }),
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
  }),
  role_id: Joi.string().required().trim().min(1).max(255).messages({
    'string.empty': 'Guest name is required',
    'string.min': 'Guest name must be at least 1 character long',
    'string.max': 'Guest name cannot exceed 255 characters',
    'any.required': 'Guest name is required'
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

// Validation schema for event ID parameter
const eventIdSchema = Joi.object({
  eventId: Joi.number().integer().min(1).required().messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0',
    'any.required': 'Event ID is required'
  })
});

module.exports = {
  createGuestSchema,
  updateGuestSchema,
  querySchema,
  idSchema,
  eventIdSchema
};
