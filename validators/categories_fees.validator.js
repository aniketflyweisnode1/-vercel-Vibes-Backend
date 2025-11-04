const Joi = require('joi');

/**
 * Categories Fees validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  categoryName: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Category name is required',
      'string.min': 'Category name must be at least 2 characters long',
      'string.max': 'Category name cannot exceed 200 characters'
    }),

  PlatformFee: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Platform fee must be a number',
      'number.min': 'Platform fee must be a positive number',
      'any.required': 'Platform fee is required'
    }),

  ProcessingFee: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Processing fee must be a number',
      'number.min': 'Processing fee must be a positive number',
      'any.required': 'Processing fee is required'
    }),

  MinFee: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Minimum fee must be a number',
      'number.min': 'Minimum fee must be a positive number',
      'any.required': 'Minimum fee is required'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create categories fees validation schema
const createCategoriesFeesSchema = Joi.object({
  categoryName: commonValidations.categoryName,
  PlatformFee: commonValidations.PlatformFee,
  ProcessingFee: commonValidations.ProcessingFee,
  MinFee: commonValidations.MinFee,
  status: commonValidations.status
});

// Update categories fees validation schema
const updateCategoriesFeesSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Categories Fees ID must be a number',
      'number.integer': 'Categories Fees ID must be an integer',
      'number.positive': 'Categories Fees ID must be a positive number',
      'any.required': 'Categories Fees ID is required'
    }),
  categoryName: commonValidations.categoryName.optional(),
  PlatformFee: commonValidations.PlatformFee.optional(),
  ProcessingFee: commonValidations.ProcessingFee.optional(),
  MinFee: commonValidations.MinFee.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field besides id must be provided for update'
});

// Get categories fees by ID validation schema
const getCategoriesFeesByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Categories Fees ID must be a number',
      'number.integer': 'Categories Fees ID must be an integer',
      'number.positive': 'Categories Fees ID must be a positive number'
    })
});

// Get all categories fees query validation schema
const getAllCategoriesFeesSchema = Joi.object({
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
    .valid('categoryName', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: categoryName, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createCategoriesFeesSchema,
  updateCategoriesFeesSchema,
  getCategoriesFeesByIdSchema,
  getAllCategoriesFeesSchema
};

