const Joi = require('joi');

// Validation schema for creating vibe business subscription
const createVibeBusinessSubscriptionSchema = Joi.object({
  planDuration: Joi.string().valid('Monthly', 'Annually').default('Monthly').messages({
    'any.only': 'Plan duration must be either Monthly or Annually'
  }),
  plan_name: Joi.string().required().trim().min(1).max(100).messages({
    'string.empty': 'Plan name is required',
    'string.min': 'Plan name must be at least 1 character long',
    'string.max': 'Plan name cannot exceed 100 characters',
    'any.required': 'Plan name is required'
  }),
  price: Joi.number().required().min(0).messages({
    'number.min': 'Price cannot be negative',
    'any.required': 'Price is required'
  }),
  description: Joi.string().trim().max(500).allow('').messages({
    'string.max': 'Description cannot exceed 500 characters'
  }),
  line_one: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Line one cannot exceed 200 characters'
  }),
  line_two: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Line two cannot exceed 200 characters'
  }),
  line_three: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Line three cannot exceed 200 characters'
  }),
  line_four: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Line four cannot exceed 200 characters'
  }),
  line_five: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Line five cannot exceed 200 characters'
  }),
  line_six: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Line six cannot exceed 200 characters'
  }),
  status: Joi.boolean().default(true)
});

// Validation schema for updating vibe business subscription
const updateVibeBusinessSubscriptionSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  }),
  planDuration: Joi.string().valid('Monthly', 'Annually').messages({
    'any.only': 'Plan duration must be either Monthly or Annually'
  }),
  plan_name: Joi.string().trim().min(1).max(100).messages({
    'string.min': 'Plan name must be at least 1 character long',
    'string.max': 'Plan name cannot exceed 100 characters'
  }),
  price: Joi.number().min(0).messages({
    'number.min': 'Price cannot be negative'
  }),
  description: Joi.string().trim().max(500).allow('').messages({
    'string.max': 'Description cannot exceed 500 characters'
  }),
  line_one: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Line one cannot exceed 200 characters'
  }),
  line_two: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Line two cannot exceed 200 characters'
  }),
  line_three: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Line three cannot exceed 200 characters'
  }),
  line_four: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Line four cannot exceed 200 characters'
  }),
  line_five: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Line five cannot exceed 200 characters'
  }),
  line_six: Joi.string().trim().max(200).allow('').messages({
    'string.max': 'Line six cannot exceed 200 characters'
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
  planDuration: Joi.string().valid('Monthly', 'Annually').allow('').messages({
    'any.only': 'Plan duration must be either Monthly or Annually'
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

module.exports = {
  createVibeBusinessSubscriptionSchema,
  updateVibeBusinessSubscriptionSchema,
  querySchema,
  idSchema
};
