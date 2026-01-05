const Joi = require('joi');

/**
 * Bank Branch Name validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  bank_branch_name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Bank branch name is required',
      'string.min': 'Bank branch name must be at least 2 characters long',
      'string.max': 'Bank branch name cannot exceed 100 characters'
    }),

  bank_name_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Bank name ID must be a number',
      'number.integer': 'Bank name ID must be an integer',
      'number.positive': 'Bank name ID must be a positive number',
      'any.required': 'Bank name ID is required'
    }),

  holderName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Holder name is required',
      'string.min': 'Holder name must be at least 2 characters long',
      'string.max': 'Holder name cannot exceed 100 characters',
      'any.required': 'Holder name is required'
    }),

  upi: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'UPI ID cannot exceed 50 characters'
    }),

  ifsc: Joi.string()
    .trim()
    .max(11)
    .optional()
    .allow('')
    .messages({
      'string.max': 'IFSC code cannot exceed 11 characters'
    }),

  accountNo: Joi.string()
    .trim()
    .min(8)
    .max(20)
    .required()
    .messages({
      'string.empty': 'Account number is required',
      'string.min': 'Account number must be at least 8 characters long',
      'string.max': 'Account number cannot exceed 20 characters',
      'any.required': 'Account number is required'
    }),

  address: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 10 characters long',
      'string.max': 'Address cannot exceed 500 characters',
      'any.required': 'Address is required'
    }),

  cardNo: Joi.string()
    .trim()
    .max(19)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Card number cannot exceed 19 characters'
    }),

  zipcode: Joi.string()
    .trim()
    .min(5)
    .max(10)
    .required()
    .messages({
      'string.empty': 'Zipcode is required',
      'string.min': 'Zipcode must be at least 5 characters long',
      'string.max': 'Zipcode cannot exceed 10 characters',
      'any.required': 'Zipcode is required'
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

// Create bank branch name validation schema
const createBankBranchNameSchema = Joi.object({
  bank_branch_name: commonValidations.bank_branch_name,
  bank_name_id: commonValidations.bank_name_id,
  holderName: commonValidations.holderName,
  upi: commonValidations.upi,
  ifsc: commonValidations.ifsc,
  accountNo: commonValidations.accountNo,
  address: commonValidations.address,
  cardNo: commonValidations.cardNo,
  zipcode: commonValidations.zipcode,
  emoji: commonValidations.emoji,
  status: commonValidations.status
});

// Update bank branch name validation schema
const updateBankBranchNameSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Bank branch name ID must be a number',
      'number.integer': 'Bank branch name ID must be an integer',
      'number.positive': 'Bank branch name ID must be a positive number',
      'any.required': 'Bank branch name ID is required'
    }),
  bank_branch_name: commonValidations.bank_branch_name.optional(),
  bank_name_id: commonValidations.bank_name_id.optional(),
  holderName: commonValidations.holderName.optional(),
  upi: commonValidations.upi.optional(),
  ifsc: commonValidations.ifsc.optional(),
  accountNo: commonValidations.accountNo.optional(),
  address: commonValidations.address.optional(),
  cardNo: commonValidations.cardNo.optional(),
  zipcode: commonValidations.zipcode.optional(),
  emoji: commonValidations.emoji.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get bank branch name by ID validation schema
const getBankBranchNameByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Bank branch name ID must be a number',
      'number.integer': 'Bank branch name ID must be an integer',
      'number.positive': 'Bank branch name ID must be a positive number'
    })
});

// Get all bank branch names query validation schema
const getAllBankBranchNamesSchema = Joi.object({
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
  bank_name_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Bank name ID must be a number',
      'number.integer': 'Bank name ID must be an integer',
      'number.positive': 'Bank name ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('bank_branch_name', 'bank_name_id', 'holderName', 'upi', 'ifsc', 'accountNo', 'address', 'cardNo', 'zipcode', 'emoji', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: bank_branch_name, bank_name_id, holderName, upi, ifsc, accountNo, address, cardNo, zipcode, emoji, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    }),
     userId: Joi.string()
    .optional()
});

// Update bank branch name by ID with ID in body validation schema
const updateBankBranchNameByIdBodySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Bank branch name ID must be a number',
      'number.integer': 'Bank branch name ID must be an integer',
      'number.positive': 'Bank branch name ID must be a positive number'
    }),
  bank_branch_name: commonValidations.bank_branch_name.optional(),
  bank_name_id: commonValidations.bank_name_id.optional(),
  holderName: commonValidations.holderName.optional(),
  upi: commonValidations.upi.optional(),
  ifsc: commonValidations.ifsc.optional(),
  accountNo: commonValidations.accountNo.optional(),
  address: commonValidations.address.optional(),
  cardNo: commonValidations.cardNo.optional(),
  zipcode: commonValidations.zipcode.optional(),
  emoji: commonValidations.emoji.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

module.exports = {
  createBankBranchNameSchema,
  updateBankBranchNameSchema,
  updateBankBranchNameByIdBodySchema,
  getBankBranchNameByIdSchema,
  getAllBankBranchNamesSchema
};
