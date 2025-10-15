const Joi = require('joi');

/**
 * Staff Working Price validation schemas using Joi
 */

// Create staff working price validation schema
const createStaffWorkingPriceSchema = Joi.object({
  staff_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Staff ID must be a number',
      'number.integer': 'Staff ID must be an integer',
      'number.positive': 'Staff ID must be a positive number',
      'any.required': 'Staff ID is required'
    }),
  staff_category_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Staff Category ID must be a number',
      'number.integer': 'Staff Category ID must be an integer',
      'number.positive': 'Staff Category ID must be a positive number',
      'any.required': 'Staff Category ID is required'
    }),
  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
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
  status: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update staff working price validation schema
const updateStaffWorkingPriceSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Staff Working Price ID must be a number',
      'number.integer': 'Staff Working Price ID must be an integer',
      'number.positive': 'Staff Working Price ID must be a positive number',
      'any.required': 'Staff Working Price ID is required'
    }),
  staff_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Staff ID must be a number',
      'number.integer': 'Staff ID must be an integer',
      'number.positive': 'Staff ID must be a positive number'
    }),
  staff_category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Staff Category ID must be a number',
      'number.integer': 'Staff Category ID must be an integer',
      'number.positive': 'Staff Category ID must be a positive number'
    }),
  price: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative'
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
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

// Get staff working price by ID validation schema
const getStaffWorkingPriceByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Staff Working Price ID must be a number',
      'number.integer': 'Staff Working Price ID must be an integer',
      'number.positive': 'Staff Working Price ID must be a positive number',
      'any.required': 'Staff Working Price ID is required'
    })
});

module.exports = {
  createStaffWorkingPriceSchema,
  updateStaffWorkingPriceSchema,
  getStaffWorkingPriceByIdSchema
};

