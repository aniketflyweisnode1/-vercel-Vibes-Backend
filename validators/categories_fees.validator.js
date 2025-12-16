const Joi = require('joi');

/**
 * Categories Fees validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  Price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price must be a positive number',
      'any.required': 'Price is required'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create categories fees validation schema
const createCategoriesFeesSchema = Joi.object({
  category_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Category ID must be a number',
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be a positive number',
      'any.required': 'Category ID is required'
    }),
  pricing_currency: Joi.string()
    .trim()
    .max(10)
    .default('USD')
    .optional()
    .messages({
      'string.max': 'Currency code cannot exceed 10 characters'
    }),
  Price: commonValidations.Price,
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
  category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Category ID must be a number',
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be a positive number'
    }),
  pricing_currency: Joi.string()
    .trim()
    .max(10)
    .optional()
    .messages({
      'string.max': 'Currency code cannot exceed 10 characters'
    }),
  Price: commonValidations.Price.optional(),
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
  category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Category ID must be a number',
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be a positive number'
    }),
  pricing_currency: Joi.string()
    .trim()
    .max(10)
    .optional()
    .messages({
      'string.max': 'Currency code cannot exceed 10 characters'
    }),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'category_id', 'Price')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, category_id, Price'
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

