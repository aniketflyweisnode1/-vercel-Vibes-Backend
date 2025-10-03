const Joi = require('joi');

/**
 * Business Type validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  business_type: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Business type is required',
      'string.min': 'Business type must be at least 2 characters long',
      'string.max': 'Business type cannot exceed 100 characters'
    }),

  emoji: Joi.string()
    .trim()
    .min(1)
    .max(10)
    .optional()
    .allow('')
    .messages({
      'string.min': 'Emoji must be at least 1 character long',
      'string.max': 'Emoji cannot exceed 10 characters'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create business type validation schema
const createBusinessTypeSchema = Joi.object({
  business_type: commonValidations.business_type,
  emoji: commonValidations.emoji,
  status: commonValidations.status
});

// Update business type validation schema
const updateBusinessTypeSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Business type ID must be a number',
      'number.integer': 'Business type ID must be an integer',
      'number.positive': 'Business type ID must be a positive number',
      'any.required': 'Business type ID is required'
    }),
  business_type: commonValidations.business_type.optional(),
  emoji: commonValidations.emoji.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get business type by ID validation schema
const getBusinessTypeByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Business type ID must be a number',
      'number.integer': 'Business type ID must be an integer',
      'number.positive': 'Business type ID must be a positive number'
    })
});

// Get all business types query validation schema
const getAllBusinessTypesSchema = Joi.object({
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
    .valid('business_type', 'emoji', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: business_type, emoji, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Update business type by ID with ID in body validation schema
const updateBusinessTypeByIdBodySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Business type ID must be a number',
      'number.integer': 'Business type ID must be an integer',
      'number.positive': 'Business type ID must be a positive number'
    }),
  business_type: commonValidations.business_type.optional(),
  emoji: commonValidations.emoji.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

module.exports = {
  createBusinessTypeSchema,
  updateBusinessTypeSchema,
  updateBusinessTypeByIdBodySchema,
  getBusinessTypeByIdSchema,
  getAllBusinessTypesSchema
};
