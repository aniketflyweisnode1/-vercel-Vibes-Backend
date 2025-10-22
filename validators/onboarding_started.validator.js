const Joi = require('joi');

/**
 * Onboarding Started validation schemas using Joi
 */

// Create onboarding started validation schema
const createOnboardingStartedSchema = Joi.object({
  Vendor_Leads_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Vendor Leads ID must be a number',
      'number.integer': 'Vendor Leads ID must be an integer',
      'number.positive': 'Vendor Leads ID must be a positive number',
      'any.required': 'Vendor Leads ID is required'
    }),
  user_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number',
      'any.required': 'User ID is required'
    }),
  covert: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Covert must be a boolean value'
    }),
  Status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update onboarding started validation schema
const updateOnboardingStartedSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Onboarding Started ID must be a number',
      'number.integer': 'Onboarding Started ID must be an integer',
      'number.positive': 'Onboarding Started ID must be a positive number',
      'any.required': 'Onboarding Started ID is required'
    }),
  Vendor_Leads_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Vendor Leads ID must be a number',
      'number.integer': 'Vendor Leads ID must be an integer',
      'number.positive': 'Vendor Leads ID must be a positive number'
    }),
  user_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),
  covert: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Covert must be a boolean value'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get onboarding started by ID validation schema
const getOnboardingStartedByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Onboarding Started ID must be a number',
      'number.integer': 'Onboarding Started ID must be an integer',
      'number.positive': 'Onboarding Started ID must be a positive number'
    })
});

// Get all onboarding started query validation schema
const getAllOnboardingStartedSchema = Joi.object({
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
  covert: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Covert must be a boolean value'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  sortBy: Joi.string()
    .valid('created_at', 'updated_at', 'covert')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, covert'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Update onboarding started by ID with ID in body validation schema
const updateOnboardingStartedByIdBodySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Onboarding Started ID must be a number',
      'number.integer': 'Onboarding Started ID must be an integer',
      'number.positive': 'Onboarding Started ID must be a positive number'
    }),
  Vendor_Leads_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Vendor Leads ID must be a number',
      'number.integer': 'Vendor Leads ID must be an integer',
      'number.positive': 'Vendor Leads ID must be a positive number'
    }),
  user_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),
  covert: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Covert must be a boolean value'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

module.exports = {
  createOnboardingStartedSchema,
  updateOnboardingStartedSchema,
  updateOnboardingStartedByIdBodySchema,
  getOnboardingStartedByIdSchema,
  getAllOnboardingStartedSchema
};
