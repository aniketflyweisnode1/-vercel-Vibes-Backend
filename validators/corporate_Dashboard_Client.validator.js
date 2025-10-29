const Joi = require('joi');

// Create corporate dashboard client validation schema
const createCorporateDashboardClientSchema = Joi.object({
  CompanyName: Joi.string()
    .required()
    .trim()
    .max(200)
    .messages({
      'string.empty': 'Company name is required',
      'string.max': 'Company name cannot exceed 200 characters',
      'any.required': 'Company name is required'
    }),
  industry: Joi.string()
    .required()
    .trim()
    .max(100)
    .messages({
      'string.empty': 'Industry is required',
      'string.max': 'Industry cannot exceed 100 characters',
      'any.required': 'Industry is required'
    }),
  EmployeeCount: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Employee count must be a number',
      'number.integer': 'Employee count must be an integer',
      'number.min': 'Employee count must be at least 1',
      'any.required': 'Employee count is required'
    }),
  ContactEmail: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Contact email is required',
      'any.required': 'Contact email is required'
    }),
  Plan_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Plan ID must be a number',
      'number.integer': 'Plan ID must be an integer',
      'number.positive': 'Plan ID must be a positive number',
      'any.required': 'Plan ID is required'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
});

// Update corporate dashboard client validation schema
const updateCorporateDashboardClientSchema = Joi.object({
  Client_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Client ID must be a number',
      'number.integer': 'Client ID must be an integer',
      'number.positive': 'Client ID must be a positive number',
      'any.required': 'Client ID is required'
    }),
  CompanyName: Joi.string()
    .optional()
    .trim()
    .max(200)
    .messages({
      'string.max': 'Company name cannot exceed 200 characters'
    }),
  industry: Joi.string()
    .optional()
    .trim()
    .max(100)
    .messages({
      'string.max': 'Industry cannot exceed 100 characters'
    }),
  EmployeeCount: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'Employee count must be a number',
      'number.integer': 'Employee count must be an integer',
      'number.min': 'Employee count must be at least 1'
    }),
  ContactEmail: Joi.string()
    .email()
    .optional()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  Plan_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Plan ID must be a number',
      'number.integer': 'Plan ID must be an integer',
      'number.positive': 'Plan ID must be a positive number'
    }),
  Status: Joi.boolean()
    .optional()
});

// Get corporate dashboard client by ID validation schema
const getCorporateDashboardClientByIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': 'ID must be a valid number',
      'any.required': 'ID is required'
    })
});

// Delete corporate dashboard client validation schema
const deleteCorporateDashboardClientSchema = Joi.object({
  id: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': 'ID must be a valid number',
      'any.required': 'ID is required'
    })
});

// Query validation schema for getAll
const querySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
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
    .optional()
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string()
    .optional()
    .allow('')
    .trim()
    .max(100)
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  industry: Joi.string()
    .optional()
    .allow('')
    .trim()
    .max(100)
    .messages({
      'string.max': 'Industry filter cannot exceed 100 characters'
    }),
  Plan_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Plan ID must be a number',
      'number.integer': 'Plan ID must be an integer',
      'number.positive': 'Plan ID must be a positive number'
    }),
  Status: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'Status must be either true or false'
    })
});

module.exports = {
  createCorporateDashboardClientSchema,
  updateCorporateDashboardClientSchema,
  getCorporateDashboardClientByIdSchema,
  deleteCorporateDashboardClientSchema,
  querySchema
};
