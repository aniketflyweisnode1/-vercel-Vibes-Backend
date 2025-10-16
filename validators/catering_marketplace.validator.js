const Joi = require('joi');

/**
 * Catering Marketplace validation schemas using Joi
 */

// Create catering marketplace validation schema
const createCateringMarketplaceSchema = Joi.object({
  catering_marketplace_category_id: Joi.number()
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
    .max(200)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 200 characters',
      'any.required': 'Name is required'
    }),
  image: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Image URL cannot exceed 500 characters'
    }),
  review_count: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Review Count must be a number',
      'number.integer': 'Review Count must be an integer',
      'number.min': 'Review Count cannot be negative'
    }),
  address: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 5 characters long',
      'string.max': 'Address cannot exceed 500 characters',
      'any.required': 'Address is required'
    }),
  mobile_no: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Mobile number is required',
      'string.pattern.base': 'Please enter a valid 10-digit mobile number',
      'any.required': 'Mobile number is required'
    }),
  status: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update catering marketplace validation schema
const updateCateringMarketplaceSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Catering Marketplace ID must be a number',
      'number.integer': 'Catering Marketplace ID must be an integer',
      'number.positive': 'Catering Marketplace ID must be a positive number',
      'any.required': 'Catering Marketplace ID is required'
    }),
  catering_marketplace_category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Catering Marketplace Category ID must be a number',
      'number.integer': 'Catering Marketplace Category ID must be an integer',
      'number.positive': 'Catering Marketplace Category ID must be a positive number'
    }),
  name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 200 characters'
    }),
  image: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Image URL cannot exceed 500 characters'
    }),
  review_count: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Review Count must be a number',
      'number.integer': 'Review Count must be an integer',
      'number.min': 'Review Count cannot be negative'
    }),
  address: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .optional()
    .messages({
      'string.min': 'Address must be at least 5 characters long',
      'string.max': 'Address cannot exceed 500 characters'
    }),
  mobile_no: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit mobile number'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

// Get catering marketplace by ID validation schema
const getCateringMarketplaceByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Catering Marketplace ID must be a number',
      'number.integer': 'Catering Marketplace ID must be an integer',
      'number.positive': 'Catering Marketplace ID must be a positive number',
      'any.required': 'Catering Marketplace ID is required'
    })
});

module.exports = {
  createCateringMarketplaceSchema,
  updateCateringMarketplaceSchema,
  getCateringMarketplaceByIdSchema
};
