const Joi = require('joi');

/**
 * Bank Name validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  bank_name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Bank name is required',
      'string.min': 'Bank name must be at least 2 characters long',
      'string.max': 'Bank name cannot exceed 100 characters'
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

// Create bank name validation schema
const createBankNameSchema = Joi.object({
  bank_name: commonValidations.bank_name,
  emoji: commonValidations.emoji,
  status: commonValidations.status
});

// Update bank name validation schema
const updateBankNameSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Bank name ID must be a number',
      'number.integer': 'Bank name ID must be an integer',
      'number.positive': 'Bank name ID must be a positive number',
      'any.required': 'Bank name ID is required'
    }),
  bank_name: commonValidations.bank_name.optional(),
  emoji: commonValidations.emoji.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get bank name by ID validation schema
const getBankNameByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Bank name ID must be a number',
      'number.integer': 'Bank name ID must be an integer',
      'number.positive': 'Bank name ID must be a positive number'
    })
});

// Get all bank names query validation schema
const getAllBankNamesSchema = Joi.object({
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
    .valid('bank_name', 'emoji', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: bank_name, emoji, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Update bank name by ID with ID in body validation schema
const updateBankNameByIdBodySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Bank name ID must be a number',
      'number.integer': 'Bank name ID must be an integer',
      'number.positive': 'Bank name ID must be a positive number'
    }),
  bank_name: commonValidations.bank_name.optional(),
  emoji: commonValidations.emoji.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

module.exports = {
  createBankNameSchema,
  updateBankNameSchema,
  updateBankNameByIdBodySchema,
  getBankNameByIdSchema,
  getAllBankNamesSchema
};
