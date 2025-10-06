const Joi = require('joi');

// Validation schema for creating filter vendor leads
const createFilterVendorLeadsSchema = Joi.object({
  vendor_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Vendor ID must be a number',
    'number.integer': 'Vendor ID must be an integer',
    'number.min': 'Vendor ID must be greater than 0',
    'any.required': 'Vendor ID is required'
  }),
  vendor_name: Joi.string().required().trim().min(1).max(255).messages({
    'string.empty': 'Vendor name is required',
    'string.min': 'Vendor name must be at least 1 character long',
    'string.max': 'Vendor name cannot exceed 255 characters',
    'any.required': 'Vendor name is required'
  }),
  platform: Joi.string().required().trim().min(1).max(100).messages({
    'string.empty': 'Platform is required',
    'string.min': 'Platform must be at least 1 character long',
    'string.max': 'Platform cannot exceed 100 characters',
    'any.required': 'Platform is required'
  }),
  shop_url: Joi.string().trim().uri().max(500).allow('').messages({
    'string.uri': 'Shop URL must be a valid URL',
    'string.max': 'Shop URL cannot exceed 500 characters'
  }),
  product_service_type: Joi.string().required().trim().min(1).max(255).messages({
    'string.empty': 'Product/Service type is required',
    'string.min': 'Product/Service type must be at least 1 character long',
    'string.max': 'Product/Service type cannot exceed 255 characters',
    'any.required': 'Product/Service type is required'
  }),
  contact_email: Joi.string().required().trim().email().lowercase().max(255).messages({
    'string.empty': 'Contact email is required',
    'string.email': 'Contact email must be a valid email address',
    'string.max': 'Contact email cannot exceed 255 characters',
    'any.required': 'Contact email is required'
  }),
  contact_phone: Joi.string().required().trim().min(10).max(20).messages({
    'string.empty': 'Contact phone is required',
    'string.min': 'Contact phone must be at least 10 characters long',
    'string.max': 'Contact phone cannot exceed 20 characters',
    'any.required': 'Contact phone is required'
  }),
  discovery_source: Joi.string().trim().max(255).allow('').messages({
    'string.max': 'Discovery source cannot exceed 255 characters'
  }),
  contact_phone_alt: Joi.string().trim().min(10).max(20).allow('').messages({
    'string.min': 'Alternative contact phone must be at least 10 characters long',
    'string.max': 'Alternative contact phone cannot exceed 20 characters'
  }),
  estimated_value: Joi.number().min(0).default(0).messages({
    'number.base': 'Estimated value must be a number',
    'number.min': 'Estimated value must be greater than or equal to 0'
  }),
  tags: Joi.array().items(
    Joi.string().trim().max(50).messages({
      'string.max': 'Each tag cannot exceed 50 characters'
    })
  ).default([]),
  notes: Joi.string().trim().max(1000).allow('').messages({
    'string.max': 'Notes cannot exceed 1000 characters'
  }),
  emozi: Joi.string().trim().max(10).allow('').messages({
    'string.max': 'Emoji cannot exceed 10 characters'
  }),
  status: Joi.boolean().default(true).messages({
    'boolean.base': 'Status must be a boolean value'
  })
});

// Validation schema for updating filter vendor leads
const updateFilterVendorLeadsSchema = Joi.object({
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
  vendor_name: Joi.string().trim().min(1).max(255).messages({
    'string.min': 'Vendor name must be at least 1 character long',
    'string.max': 'Vendor name cannot exceed 255 characters'
  }),
  platform: Joi.string().trim().min(1).max(100).messages({
    'string.min': 'Platform must be at least 1 character long',
    'string.max': 'Platform cannot exceed 100 characters'
  }),
  shop_url: Joi.string().trim().uri().max(500).allow('').messages({
    'string.uri': 'Shop URL must be a valid URL',
    'string.max': 'Shop URL cannot exceed 500 characters'
  }),
  product_service_type: Joi.string().trim().min(1).max(255).messages({
    'string.min': 'Product/Service type must be at least 1 character long',
    'string.max': 'Product/Service type cannot exceed 255 characters'
  }),
  contact_email: Joi.string().trim().email().lowercase().max(255).messages({
    'string.email': 'Contact email must be a valid email address',
    'string.max': 'Contact email cannot exceed 255 characters'
  }),
  contact_phone: Joi.string().trim().min(10).max(20).messages({
    'string.min': 'Contact phone must be at least 10 characters long',
    'string.max': 'Contact phone cannot exceed 20 characters'
  }),
  discovery_source: Joi.string().trim().max(255).allow('').messages({
    'string.max': 'Discovery source cannot exceed 255 characters'
  }),
  contact_phone_alt: Joi.string().trim().min(10).max(20).allow('').messages({
    'string.min': 'Alternative contact phone must be at least 10 characters long',
    'string.max': 'Alternative contact phone cannot exceed 20 characters'
  }),
  estimated_value: Joi.number().min(0).messages({
    'number.base': 'Estimated value must be a number',
    'number.min': 'Estimated value must be greater than or equal to 0'
  }),
  tags: Joi.array().items(
    Joi.string().trim().max(50).messages({
      'string.max': 'Each tag cannot exceed 50 characters'
    })
  ),
  notes: Joi.string().trim().max(1000).allow('').messages({
    'string.max': 'Notes cannot exceed 1000 characters'
  }),
  emozi: Joi.string().trim().max(10).allow('').messages({
    'string.max': 'Emoji cannot exceed 10 characters'
  }),
  status: Joi.boolean().messages({
    'boolean.base': 'Status must be a boolean value'
  })
}).min(2).messages({
  'object.min': 'At least one field must be provided for update (excluding ID)'
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
  platform: Joi.string().trim().max(100).allow('').messages({
    'string.max': 'Platform cannot exceed 100 characters'
  }),
  product_service_type: Joi.string().trim().max(255).allow('').messages({
    'string.max': 'Product/Service type cannot exceed 255 characters'
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
  createFilterVendorLeadsSchema,
  updateFilterVendorLeadsSchema,
  querySchema,
  idSchema
};
