const Joi = require('joi');

/**
 * Business Category validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  business_category: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Business category is required',
      'string.min': 'Business category must be at least 2 characters long',
      'string.max': 'Business category cannot exceed 100 characters'
    }),

  business_type_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Business type ID must be a number',
      'number.integer': 'Business type ID must be an integer',
      'number.positive': 'Business type ID must be a positive number',
      'any.required': 'Business type ID is required'
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

// Create business category validation schema
const createBusinessCategorySchema = Joi.object({
  business_category: commonValidations.business_category,
  business_type_id: commonValidations.business_type_id,
  emoji: commonValidations.emoji,
  status: commonValidations.status
});

// Update business category validation schema
const updateBusinessCategorySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Business category ID must be a number',
      'number.integer': 'Business category ID must be an integer',
      'number.positive': 'Business category ID must be a positive number',
      'any.required': 'Business category ID is required'
    }),
  business_category: commonValidations.business_category.optional(),
  business_type_id: commonValidations.business_type_id.optional(),
  emoji: commonValidations.emoji.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get business category by ID validation schema
const getBusinessCategoryByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Business category ID must be a number',
      'number.integer': 'Business category ID must be an integer',
      'number.positive': 'Business category ID must be a positive number'
    })
});

// Get all business categories query validation schema
const getAllBusinessCategoriesSchema = Joi.object({
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
  status: Joi.alternatives()
    .try(
      Joi.boolean(),
      Joi.string().valid('true', 'false')
    )
    .optional()
    .messages({
      'alternatives.match': 'Status must be a boolean value or "true"/"false" string'
    }),
  sortBy: Joi.string()
    .valid('business_category', 'emoji', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: business_category, emoji, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Update business category by ID with ID in body validation schema
const updateBusinessCategoryByIdBodySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Business category ID must be a number',
      'number.integer': 'Business category ID must be an integer',
      'number.positive': 'Business category ID must be a positive number'
    }),
  business_category: commonValidations.business_category.optional(),
  business_type_id: commonValidations.business_type_id.optional(),
  emoji: commonValidations.emoji.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

module.exports = {
  createBusinessCategorySchema,
  updateBusinessCategorySchema,
  updateBusinessCategoryByIdBodySchema,
  getBusinessCategoryByIdSchema,
  getAllBusinessCategoriesSchema
};
