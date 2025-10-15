const Joi = require('joi');

/**
 * Staff Category validation schemas using Joi
 */

// Create staff category validation schema
const createStaffCategorySchema = Joi.object({
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
  status: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update staff category validation schema
const updateStaffCategorySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Staff Category ID must be a number',
      'number.integer': 'Staff Category ID must be an integer',
      'number.positive': 'Staff Category ID must be a positive number',
      'any.required': 'Staff Category ID is required'
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
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

// Get staff category by ID validation schema
const getStaffCategoryByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Staff Category ID must be a number',
      'number.integer': 'Staff Category ID must be an integer',
      'number.positive': 'Staff Category ID must be a positive number',
      'any.required': 'Staff Category ID is required'
    })
});

module.exports = {
  createStaffCategorySchema,
  updateStaffCategorySchema,
  getStaffCategoryByIdSchema
};

