const Joi = require('joi');

// Create wallet validation schema
const createWalletSchema = Joi.object({
  user_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number',
      'any.required': 'User ID is required'
    }),
  amount: Joi.number().min(0).optional()
    .messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount cannot be negative'
    }),
  emoji: Joi.string().max(10).optional()
    .messages({
      'string.max': 'Emoji cannot exceed 10 characters'
    }),
  status: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update wallet validation schema
const updateWalletSchema = Joi.object({
  wallet_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Wallet ID must be a number',
      'number.integer': 'Wallet ID must be an integer',
      'number.positive': 'Wallet ID must be a positive number',
      'any.required': 'Wallet ID is required'
    }),
  amount: Joi.number().min(0).optional()
    .messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount cannot be negative'
    }),
  emoji: Joi.string().max(10).optional()
    .messages({
      'string.max': 'Emoji cannot exceed 10 characters'
    }),
  status: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Get wallet by ID validation schema
const getWalletByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer',
      'number.positive': 'ID must be a positive number',
      'any.required': 'ID is required'
    })
});

// Get all wallets query validation schema
const getAllWalletsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional()
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number().integer().min(1).max(100).optional()
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string().max(100).allow('').optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  status: Joi.string().valid('true', 'false').optional()
    .messages({
      'any.only': 'Status must be either "true" or "false"'
    }),
  user_id: Joi.number().integer().positive().allow('').optional()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'amount', 'wallet_id').optional()
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, amount, wallet_id'
    }),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"'
    })
});

module.exports = {
  createWalletSchema,
  updateWalletSchema,
  getWalletByIdSchema,
  getAllWalletsSchema
};
