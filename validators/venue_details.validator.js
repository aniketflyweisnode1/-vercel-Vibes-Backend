const Joi = require('joi');

// Validation schema for creating venue details
const createVenueDetailsSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(255).messages({
    'string.empty': 'Venue name is required',
    'string.min': 'Venue name must be at least 1 character long',
    'string.max': 'Venue name cannot exceed 255 characters',
    'any.required': 'Venue name is required'
  }),
  address: Joi.string().required().trim().min(1).max(500).messages({
    'string.empty': 'Address is required',
    'string.min': 'Address must be at least 1 character long',
    'string.max': 'Address cannot exceed 500 characters',
    'any.required': 'Address is required'
  }),
  capacity: Joi.number().required().integer().min(1).messages({
    'number.min': 'Capacity must be at least 1',
    'number.integer': 'Capacity must be an integer',
    'any.required': 'Capacity is required'
  }),
  type: Joi.string().required().trim().min(1).max(100).messages({
    'string.empty': 'Venue type is required',
    'string.min': 'Venue type must be at least 1 character long',
    'string.max': 'Venue type cannot exceed 100 characters',
    'any.required': 'Venue type is required'
  }),
  map: Joi.string().trim().uri().allow('').messages({
    'string.uri': 'Map must be a valid URL'
  }),
  status: Joi.boolean().default(true)
});

// Validation schema for updating venue details
const updateVenueDetailsSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  }),
  name: Joi.string().trim().min(1).max(255).messages({
    'string.min': 'Venue name must be at least 1 character long',
    'string.max': 'Venue name cannot exceed 255 characters'
  }),
  address: Joi.string().trim().min(1).max(500).messages({
    'string.min': 'Address must be at least 1 character long',
    'string.max': 'Address cannot exceed 500 characters'
  }),
  capacity: Joi.number().integer().min(1).messages({
    'number.min': 'Capacity must be at least 1',
    'number.integer': 'Capacity must be an integer'
  }),
  type: Joi.string().trim().min(1).max(100).messages({
    'string.min': 'Venue type must be at least 1 character long',
    'string.max': 'Venue type cannot exceed 100 characters'
  }),
  map: Joi.string().trim().uri().allow('').messages({
    'string.uri': 'Map must be a valid URL'
  }),
  status: Joi.boolean()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation schema for query parameters
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(255).allow(''),
  status: Joi.string().valid('true', 'false').allow(''),
  type: Joi.string().trim().max(100).allow('')
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
  createVenueDetailsSchema,
  updateVenueDetailsSchema,
  querySchema,
  idSchema
};
