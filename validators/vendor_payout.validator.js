const Joi = require('joi');

// Validation schema for creating vendor payout
const createVendorPayoutSchema = Joi.object({
  Vendor_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Vendor ID must be a number',
    'number.integer': 'Vendor ID must be an integer',
    'number.min': 'Vendor ID must be greater than 0',
    'any.required': 'Vendor ID is required'
  }),
  amount: Joi.number().min(0).required().messages({
    'number.base': 'Amount must be a number',
    'number.min': 'Amount cannot be negative',
    'any.required': 'Amount is required'
  }),
  paymentType: Joi.string().trim().max(50).optional().allow(null).allow('').messages({
    'string.max': 'Payment type cannot exceed 50 characters'
  }),
  bank_branch_name_id: Joi.number().integer().min(1).optional().allow(null).messages({
    'number.base': 'Bank branch name ID must be a number',
    'number.integer': 'Bank branch name ID must be an integer',
    'number.min': 'Bank branch name ID must be greater than 0'
  }),
  Event_Id: Joi.number().integer().min(1).optional().allow(null).messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0'
  }),
  PendingAmount: Joi.number().min(0).optional().default(0).messages({
    'number.base': 'Pending amount must be a number',
    'number.min': 'Pending amount cannot be negative'
  }),
  Status: Joi.boolean().optional().default(true)
});

// Validation schema for updating vendor payout
const updateVendorPayoutSchema = Joi.object({
  Vendor_Payout_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Vendor Payout ID must be a number',
    'number.integer': 'Vendor Payout ID must be an integer',
    'number.min': 'Vendor Payout ID must be greater than 0',
    'any.required': 'Vendor Payout ID is required'
  }),
  Vendor_id: Joi.number().integer().min(1).optional().messages({
    'number.base': 'Vendor ID must be a number',
    'number.integer': 'Vendor ID must be an integer',
    'number.min': 'Vendor ID must be greater than 0'
  }),
  amount: Joi.number().min(0).optional().messages({
    'number.base': 'Amount must be a number',
    'number.min': 'Amount cannot be negative'
  }),
  paymentType: Joi.string().trim().max(50).optional().allow(null).allow('').messages({
    'string.max': 'Payment type cannot exceed 50 characters'
  }),
  bank_branch_name_id: Joi.number().integer().min(1).optional().allow(null).messages({
    'number.base': 'Bank branch name ID must be a number',
    'number.integer': 'Bank branch name ID must be an integer',
    'number.min': 'Bank branch name ID must be greater than 0'
  }),
  Event_Id: Joi.number().integer().min(1).optional().allow(null).messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0'
  }),
  PendingAmount: Joi.number().min(0).optional().messages({
    'number.base': 'Pending amount must be a number',
    'number.min': 'Pending amount cannot be negative'
  }),
  Status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation schema for query parameters
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('true', 'false').allow(''),
  Vendor_id: Joi.number().integer().min(1).optional()
});

// Validation schema for ID parameter
const idSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  })
});

module.exports = {
  createVendorPayoutSchema,
  updateVendorPayoutSchema,
  querySchema,
  idSchema
};

