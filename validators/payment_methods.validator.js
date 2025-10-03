const Joi = require('joi');

/**
 * Payment Methods validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  payment_method: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Payment method is required',
      'string.min': 'Payment method must be at least 2 characters long',
      'string.max': 'Payment method cannot exceed 100 characters'
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

// Create payment method validation schema
const createPaymentMethodSchema = Joi.object({
  payment_method: commonValidations.payment_method,
  emoji: commonValidations.emoji,
  status: commonValidations.status
});

// Update payment method validation schema
const updatePaymentMethodSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Payment method ID must be a number',
      'number.integer': 'Payment method ID must be an integer',
      'number.positive': 'Payment method ID must be a positive number',
      'any.required': 'Payment method ID is required'
    }),
  payment_method: commonValidations.payment_method.optional(),
  emoji: commonValidations.emoji.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get payment method by ID validation schema
const getPaymentMethodByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Payment method ID must be a number',
      'number.integer': 'Payment method ID must be an integer',
      'number.positive': 'Payment method ID must be a positive number'
    })
});

// Get all payment methods query validation schema
const getAllPaymentMethodsSchema = Joi.object({
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
    .valid('payment_method', 'emoji', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: payment_method, emoji, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Update payment method by ID with ID in body validation schema
const updatePaymentMethodByIdBodySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Payment method ID must be a number',
      'number.integer': 'Payment method ID must be an integer',
      'number.positive': 'Payment method ID must be a positive number'
    }),
  payment_method: commonValidations.payment_method.optional(),
  emoji: commonValidations.emoji.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

module.exports = {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
  updatePaymentMethodByIdBodySchema,
  getPaymentMethodByIdSchema,
  getAllPaymentMethodsSchema
};
