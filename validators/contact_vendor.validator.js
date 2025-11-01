const Joi = require('joi');

// Validation schema for creating contact vendor
const createContactVendorSchema = Joi.object({
  vendor_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Vendor ID must be a number',
    'number.integer': 'Vendor ID must be an integer',
    'number.min': 'Vendor ID must be greater than 0',
    'any.required': 'Vendor ID is required'
  }),
  user_id: Joi.number().integer().min(1).optional().messages({
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'number.min': 'User ID must be greater than 0'
  }),
 
  topic: Joi.string().trim().min(1).max(200).required().messages({
    'string.empty': 'Topic is required',
    'string.min': 'Topic must be at least 1 character long',
    'string.max': 'Topic cannot exceed 200 characters',
    'any.required': 'Topic is required'
  }),
  description: Joi.string().trim().min(1).max(1000).required().messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 1 character long',
    'string.max': 'Description cannot exceed 1000 characters',
    'any.required': 'Description is required'
  }),
  status: Joi.boolean().default(true).messages({
    'boolean.base': 'Status must be a boolean value'
  })
});

// Validation schema for updating contact vendor
const updateContactVendorSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  }),
  vendor_id: Joi.number().integer().min(1).messages({
    'number.base': 'Vendor ID must be a number',
    'number.integer': 'Vendor ID must be an integer',
    'number.min': 'Vendor ID must be greater than 0'
  }),
  user_id: Joi.number().integer().min(1).messages({
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'number.min': 'User ID must be greater than 0'
  }),
  
  topic: Joi.string().trim().min(1).max(200).messages({
    'string.empty': 'Topic cannot be empty',
    'string.min': 'Topic must be at least 1 character long',
    'string.max': 'Topic cannot exceed 200 characters'
  }),
  description: Joi.string().trim().min(1).max(1000).messages({
    'string.empty': 'Description cannot be empty',
    'string.min': 'Description must be at least 1 character long',
    'string.max': 'Description cannot exceed 1000 characters'
  }),
  status: Joi.boolean().messages({
    'boolean.base': 'Status must be a boolean value'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation schema for query parameters
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(255).allow(''),
  status: Joi.string().valid('true', 'false').allow(''),
  vendor_id: Joi.number().integer().min(1).allow('').messages({
    'number.base': 'Vendor ID must be a number',
    'number.integer': 'Vendor ID must be an integer',
    'number.min': 'Vendor ID must be greater than 0'
  }),
  user_id: Joi.number().integer().min(1).allow('').messages({
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'number.min': 'User ID must be greater than 0'
  }),
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
  createContactVendorSchema,
  updateContactVendorSchema,
  querySchema,
  idSchema
};

