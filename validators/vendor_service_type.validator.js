const Joi = require('joi');

/**
 * Vendor Service Type validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),

  emoji: Joi.string()
    .trim()
    .max(10)
    .optional()
    .messages({
      'string.max': 'Emoji cannot exceed 10 characters'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create vendor service type validation schema
const createVendorServiceTypeSchema = Joi.object({
  name: commonValidations.name,
  emoji: commonValidations.emoji,
  status: commonValidations.status
});

// Update vendor service type validation schema
const updateVendorServiceTypeSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Vendor Service Type ID must be a number',
      'number.integer': 'Vendor Service Type ID must be an integer',
      'number.positive': 'Vendor Service Type ID must be a positive number'
    }),
  name: commonValidations.name.optional(),
  emoji: commonValidations.emoji.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get vendor service type by ID validation schema
const getVendorServiceTypeByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Vendor Service Type ID must be a number',
      'number.integer': 'Vendor Service Type ID must be an integer',
      'number.positive': 'Vendor Service Type ID must be a positive number'
    })
});

// Get all vendor service types query validation schema
const getAllVendorServiceTypesSchema = Joi.object({
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
  sortBy: Joi.string()
    .valid('name', 'emoji', 'status', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: name, emoji, status, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createVendorServiceTypeSchema,
  updateVendorServiceTypeSchema,
  getVendorServiceTypeByIdSchema,
  getAllVendorServiceTypesSchema
};
