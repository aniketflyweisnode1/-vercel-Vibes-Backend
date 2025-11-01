const Joi = require('joi');

// Validation schema for creating vibe business plan subscribed
const createVibeBusinessPlanSubscribedSchema = Joi.object({
  user_id: Joi.number().integer().min(1).optional().messages({
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'number.min': 'User ID must be greater than 0'
  }),
  plan_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Plan ID must be a number',
    'number.integer': 'Plan ID must be an integer',
    'number.min': 'Plan ID must be greater than 0',
    'any.required': 'Plan ID is required'
  }),
  transaction_id: Joi.number().integer().min(1).allow(null).optional().messages({
    'number.base': 'Transaction ID must be a number',
    'number.integer': 'Transaction ID must be an integer',
    'number.min': 'Transaction ID must be greater than 0'
  }),
  payment_method_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Payment method ID must be a number',
    'number.integer': 'Payment method ID must be an integer',
    'number.min': 'Payment method ID must be greater than 0',
    'any.required': 'Payment method ID is required for subscription payment'
  }),
  billingDetails: Joi.object({
    name: Joi.string().trim().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().trim().optional(),
    address: Joi.object({
      line1: Joi.string().trim().optional(),
      line2: Joi.string().trim().optional(),
      city: Joi.string().trim().optional(),
      state: Joi.string().trim().optional(),
      postal_code: Joi.string().trim().optional(),
      country: Joi.string().trim().optional()
    }).optional()
  }).optional(),
  transaction_status: Joi.string().valid('pending', 'completed', 'failed').default('pending').messages({
    'any.only': 'Transaction status must be one of: pending, completed, failed'
  }),
  start_plan_date: Joi.date().allow(null).messages({
    'date.base': 'Start plan date must be a valid date'
  }),
  end_plan_date: Joi.date().allow(null).messages({
    'date.base': 'End plan date must be a valid date'
  }),
  status: Joi.boolean().default(true)
});

// Validation schema for updating vibe business plan subscribed
const updateVibeBusinessPlanSubscribedSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  }),
  user_id: Joi.number().integer().min(1).messages({
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'number.min': 'User ID must be greater than 0'
  }),
  plan_id: Joi.number().integer().min(1).messages({
    'number.base': 'Plan ID must be a number',
    'number.integer': 'Plan ID must be an integer',
    'number.min': 'Plan ID must be greater than 0'
  }),
  transaction_id: Joi.number().integer().min(1).allow(null).messages({
    'number.base': 'Transaction ID must be a number',
    'number.integer': 'Transaction ID must be an integer',
    'number.min': 'Transaction ID must be greater than 0'
  }),
  payment_method_id: Joi.number().integer().min(1).allow(null).messages({
    'number.base': 'Payment method ID must be a number',
    'number.integer': 'Payment method ID must be an integer',
    'number.min': 'Payment method ID must be greater than 0'
  }),
  transaction_status: Joi.string().valid('pending', 'completed', 'failed').messages({
    'any.only': 'Transaction status must be one of: pending, completed, failed'
  }),
  start_plan_date: Joi.date().allow(null).messages({
    'date.base': 'Start plan date must be a valid date'
  }),
  end_plan_date: Joi.date().allow(null).messages({
    'date.base': 'End plan date must be a valid date'
  }),
  status: Joi.boolean()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation schema for query parameters
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(255).allow(''),
  status: Joi.string().valid('true', 'false').allow(''),
  transaction_status: Joi.string().valid('pending', 'completed', 'failed').allow('').messages({
    'any.only': 'Transaction status must be one of: pending, completed, failed'
  }),
  user_id: Joi.number().integer().min(1).allow('').messages({
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'number.min': 'User ID must be greater than 0'
  })
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

// Validation schema for update after transaction
const updateAfterTransactionSchema = Joi.object({
  transaction_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Transaction ID must be a number',
    'number.integer': 'Transaction ID must be an integer',
    'number.min': 'Transaction ID must be greater than 0',
    'any.required': 'Transaction ID is required'
  })
});

// Validation schema for subscription payment
const paymentSubscriptionSchema = Joi.object({
  vibe_business_plan_subscribed_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Vibe Business Plan Subscribed ID must be a number',
    'number.integer': 'Vibe Business Plan Subscribed ID must be an integer',
    'number.min': 'Vibe Business Plan Subscribed ID must be greater than 0',
    'any.required': 'Vibe Business Plan Subscribed ID is required'
  }),
  payment_method_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Payment method ID must be a number',
    'number.integer': 'Payment method ID must be an integer',
    'number.min': 'Payment method ID must be greater than 0',
    'any.required': 'Payment method ID is required'
  }),
  billingDetails: Joi.object({
    name: Joi.string().trim().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().trim().optional(),
    address: Joi.object({
      line1: Joi.string().trim().optional(),
      line2: Joi.string().trim().optional(),
      city: Joi.string().trim().optional(),
      state: Joi.string().trim().optional(),
      postal_code: Joi.string().trim().optional(),
      country: Joi.string().trim().optional()
    }).optional()
  }).optional(),
  description: Joi.string().trim().max(500).optional().messages({
    'string.max': 'Description cannot exceed 500 characters'
  })
});

module.exports = {
  createVibeBusinessPlanSubscribedSchema,
  updateVibeBusinessPlanSubscribedSchema,
  updateAfterTransactionSchema,
  paymentSubscriptionSchema,
  querySchema,
  idSchema
};
