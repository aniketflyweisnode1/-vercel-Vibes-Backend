const Joi = require('joi');

// Create transaction validation schema
const createTransactionSchema = Joi.object({
  user_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number',
      'any.required': 'User ID is required'
    }),
  amount: Joi.number().min(0).required()
    .messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount cannot be negative',
      'any.required': 'Amount is required'
    }),
  status: Joi.string().valid('pending', 'completed', 'failed').optional()
    .messages({
      'any.only': 'Status must be one of: pending, completed, failed'
    }),
  payment_method_id: Joi.string().hex().length(24).required()
    .messages({
      'string.empty': 'Payment method ID is required',
      'string.hex': 'Payment method ID must be a valid ObjectId',
      'string.length': 'Payment method ID must be 24 characters long',
      'any.required': 'Payment method ID is required'
    }),
  transactionType: Joi.string().valid('Registration_fee', 'deposit', 'withdraw', 'RechargeByAdmin', 'Call', 'Package_Buy', 'Recharge').required()
    .messages({
      'any.only': 'Transaction type must be one of: Registration_fee, deposit, withdraw, RechargeByAdmin, Call, Package_Buy, Recharge',
      'any.required': 'Transaction type is required'
    }),
  transaction_date: Joi.date().optional()
    .messages({
      'date.base': 'Transaction date must be a valid date'
    }),
  reference_number: Joi.string().max(100).optional()
    .messages({
      'string.max': 'Reference number cannot exceed 100 characters'
    }),
  coupon_code_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Coupon code ID must be a number',
      'number.integer': 'Coupon code ID must be an integer',
      'number.positive': 'Coupon code ID must be a positive number'
    }),
  CGST: Joi.number().min(0).optional()
    .messages({
      'number.base': 'CGST must be a number',
      'number.min': 'CGST cannot be negative'
    }),
  SGST: Joi.number().min(0).optional()
    .messages({
      'number.base': 'SGST must be a number',
      'number.min': 'SGST cannot be negative'
    }),
  TotalGST: Joi.number().min(0).optional()
    .messages({
      'number.base': 'Total GST must be a number',
      'number.min': 'Total GST cannot be negative'
    }),
  bank_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Bank ID must be a number',
      'number.integer': 'Bank ID must be an integer',
      'number.positive': 'Bank ID must be a positive number'
    }),
  bank_branch_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Bank branch ID must be a number',
      'number.integer': 'Bank branch ID must be an integer',
      'number.positive': 'Bank branch ID must be a positive number'
    }),
  isDownloaded: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Is downloaded must be a boolean value'
    }),
  fileDownlodedPath: Joi.string().max(500).optional()
    .messages({
      'string.max': 'File download path cannot exceed 500 characters'
    })
});

// Update transaction validation schema
const updateTransactionSchema = Joi.object({
  transaction_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Transaction ID must be a number',
      'number.integer': 'Transaction ID must be an integer',
      'number.positive': 'Transaction ID must be a positive number',
      'any.required': 'Transaction ID is required'
    }),
  user_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),
  amount: Joi.number().min(0).optional()
    .messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount cannot be negative'
    }),
  status: Joi.string().valid('pending', 'completed', 'failed').optional()
    .messages({
      'any.only': 'Status must be one of: pending, completed, failed'
    }),
  payment_method_id: Joi.string().hex().length(24).optional()
    .messages({
      'string.hex': 'Payment method ID must be a valid ObjectId',
      'string.length': 'Payment method ID must be 24 characters long'
    }),
  transactionType: Joi.string().valid('Registration_fee', 'deposit', 'withdraw', 'RechargeByAdmin', 'Call', 'Package_Buy', 'Recharge').optional()
    .messages({
      'any.only': 'Transaction type must be one of: Registration_fee, deposit, withdraw, RechargeByAdmin, Call, Package_Buy, Recharge'
    }),
  transaction_date: Joi.date().optional()
    .messages({
      'date.base': 'Transaction date must be a valid date'
    }),
  reference_number: Joi.string().max(100).optional()
    .messages({
      'string.max': 'Reference number cannot exceed 100 characters'
    }),
  coupon_code_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Coupon code ID must be a number',
      'number.integer': 'Coupon code ID must be an integer',
      'number.positive': 'Coupon code ID must be a positive number'
    }),
  CGST: Joi.number().min(0).optional()
    .messages({
      'number.base': 'CGST must be a number',
      'number.min': 'CGST cannot be negative'
    }),
  SGST: Joi.number().min(0).optional()
    .messages({
      'number.base': 'SGST must be a number',
      'number.min': 'SGST cannot be negative'
    }),
  TotalGST: Joi.number().min(0).optional()
    .messages({
      'number.base': 'Total GST must be a number',
      'number.min': 'Total GST cannot be negative'
    }),
  bank_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Bank ID must be a number',
      'number.integer': 'Bank ID must be an integer',
      'number.positive': 'Bank ID must be a positive number'
    }),
  bank_branch_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'Bank branch ID must be a number',
      'number.integer': 'Bank branch ID must be an integer',
      'number.positive': 'Bank branch ID must be a positive number'
    }),
  isDownloaded: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Is downloaded must be a boolean value'
    }),
  fileDownlodedPath: Joi.string().max(500).optional()
    .messages({
      'string.max': 'File download path cannot exceed 500 characters'
    })
});

// Get transaction by ID validation schema
const getTransactionByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer',
      'number.positive': 'ID must be a positive number',
      'any.required': 'ID is required'
    })
});

// Get transaction by transaction type validation schema
const getTransactionByTransactionTypeSchema = Joi.object({
  transactionType: Joi.string().valid('Registration_fee', 'deposit', 'withdraw', 'RechargeByAdmin', 'Call', 'Package_Buy', 'Recharge').required()
    .messages({
      'any.only': 'Transaction type must be one of: Registration_fee, deposit, withdraw, RechargeByAdmin, Call, Package_Buy, Recharge',
      'any.required': 'Transaction type is required'
    })
});

// Get all transactions query validation schema
const getAllTransactionsSchema = Joi.object({
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
  status: Joi.string().valid('pending', 'completed', 'failed').allow('').optional()
    .messages({
      'any.only': 'Status must be one of: pending, completed, failed'
    }),
  user_id: Joi.number().integer().positive().allow('').optional()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),
  transactionType: Joi.string().valid('Registration_fee', 'deposit', 'withdraw', 'RechargeByAdmin', 'Call', 'Package_Buy', 'Recharge').allow('').optional()
    .messages({
      'any.only': 'Transaction type must be one of: Registration_fee, deposit, withdraw, RechargeByAdmin, Call, Package_Buy, Recharge'
    }),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'transaction_id', 'user_id', 'amount', 'transaction_date').optional()
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, transaction_id, user_id, amount, transaction_date'
    }),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"'
    })
});

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  getTransactionByIdSchema,
  getTransactionByTransactionTypeSchema,
  getAllTransactionsSchema
};
