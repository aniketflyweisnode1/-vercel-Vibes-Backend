const Joi = require('joi');

/**
 * OTP validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  otp_type: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'OTP Type must be a number',
      'number.integer': 'OTP Type must be an integer',
      'number.positive': 'OTP Type must be a positive number',
      'any.required': 'OTP Type is required'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create OTP validation schema
const createOTPSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    }),
  otp_type: commonValidations.otp_type,
  status: commonValidations.status
});

// Update OTP validation schema
const updateOTPSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .optional()
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  otp_type: commonValidations.otp_type.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get OTP by ID validation schema
const getOTPByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'OTP ID must be a number',
      'number.integer': 'OTP ID must be an integer',
      'number.positive': 'OTP ID must be a positive number'
    })
});

// Get all OTPs query validation schema
const getAllOTPsSchema = Joi.object({
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
  otp_type: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'OTP Type must be a number',
      'number.integer': 'OTP Type must be an integer',
      'number.positive': 'OTP Type must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('otp', 'otp_type', 'status', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: otp, otp_type, status, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createOTPSchema,
  updateOTPSchema,
  getOTPByIdSchema,
  getAllOTPsSchema
};
