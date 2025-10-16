const Joi = require('joi');

/**
 * Catering Marketplace Category validation schemas using Joi
 */

// Create catering marketplace category validation schema
const createCateringMarketplaceCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
  dish: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Dish is required',
      'string.min': 'Dish must be at least 2 characters long',
      'string.max': 'Dish cannot exceed 200 characters',
      'any.required': 'Dish is required'
    }),
  status: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update catering marketplace category validation schema
const updateCateringMarketplaceCategorySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Catering Marketplace Category ID must be a number',
      'number.integer': 'Catering Marketplace Category ID must be an integer',
      'number.positive': 'Catering Marketplace Category ID must be a positive number',
      'any.required': 'Catering Marketplace Category ID is required'
    }),
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
  dish: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Dish must be at least 2 characters long',
      'string.max': 'Dish cannot exceed 200 characters'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

// Get catering marketplace category by ID validation schema
const getCateringMarketplaceCategoryByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Catering Marketplace Category ID must be a number',
      'number.integer': 'Catering Marketplace Category ID must be an integer',
      'number.positive': 'Catering Marketplace Category ID must be a positive number',
      'any.required': 'Catering Marketplace Category ID is required'
    })
});

module.exports = {
  createCateringMarketplaceCategorySchema,
  updateCateringMarketplaceCategorySchema,
  getCateringMarketplaceCategoryByIdSchema
};
