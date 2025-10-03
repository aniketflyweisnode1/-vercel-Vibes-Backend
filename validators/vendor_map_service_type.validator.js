const Joi = require('joi');

/**
 * Vendor Map Service Type validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  vendor_service_type_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Vendor Service Type ID must be a number',
      'number.integer': 'Vendor Service Type ID must be an integer',
      'number.positive': 'Vendor Service Type ID must be a positive number',
      'any.required': 'Vendor Service Type ID is required'
    }),

  vendor_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Vendor ID must be a number',
      'number.integer': 'Vendor ID must be an integer',
      'number.positive': 'Vendor ID must be a positive number',
      'any.required': 'Vendor ID is required'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create vendor map service type validation schema
const createVendorMapServiceTypeSchema = Joi.object({
  vendor_service_type_id: commonValidations.vendor_service_type_id,
  vendor_id: commonValidations.vendor_id,
  status: commonValidations.status
});

// Update vendor map service type validation schema
const updateVendorMapServiceTypeSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Vendor Map Service Type ID must be a number',
      'number.integer': 'Vendor Map Service Type ID must be an integer',
      'number.positive': 'Vendor Map Service Type ID must be a positive number'
    }),
  vendor_service_type_id: commonValidations.vendor_service_type_id.optional(),
  vendor_id: commonValidations.vendor_id.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get vendor map service type by ID validation schema
const getVendorMapServiceTypeByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Vendor Map Service Type ID must be a number',
      'number.integer': 'Vendor Map Service Type ID must be an integer',
      'number.positive': 'Vendor Map Service Type ID must be a positive number'
    })
});

// Get all vendor map service types query validation schema
const getAllVendorMapServiceTypesSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  vendor_service_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Vendor Service Type ID must be a number',
      'number.integer': 'Vendor Service Type ID must be an integer',
      'number.positive': 'Vendor Service Type ID must be a positive number'
    }),
  vendor_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Vendor ID must be a number',
      'number.integer': 'Vendor ID must be an integer',
      'number.positive': 'Vendor ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('vendor_service_type_id', 'vendor_id', 'status', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: vendor_service_type_id, vendor_id, status, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createVendorMapServiceTypeSchema,
  updateVendorMapServiceTypeSchema,
  getVendorMapServiceTypeByIdSchema,
  getAllVendorMapServiceTypesSchema
};
