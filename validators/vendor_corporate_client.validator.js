const Joi = require('joi');

// Validation schema for creating vendor corporate client
const createVendorCorporateClientSchema = Joi.object({
  vendor_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Vendor ID must be a number',
    'number.integer': 'Vendor ID must be an integer',
    'number.min': 'Vendor ID must be greater than 0',
    'any.required': 'Vendor ID is required'
  }),
  company_name: Joi.string().required().trim().min(1).max(255).messages({
    'string.empty': 'Company name is required',
    'string.min': 'Company name must be at least 1 character long',
    'string.max': 'Company name cannot exceed 255 characters',
    'any.required': 'Company name is required'
  }),
  industry: Joi.string().required().trim().min(1).max(255).messages({
    'string.empty': 'Industry is required',
    'string.min': 'Industry must be at least 1 character long',
    'string.max': 'Industry cannot exceed 255 characters',
    'any.required': 'Industry is required'
  }),
  employee_count: Joi.number().integer().min(1).required().messages({
    'number.base': 'Employee count must be a number',
    'number.integer': 'Employee count must be an integer',
    'number.min': 'Employee count must be at least 1',
    'any.required': 'Employee count is required'
  }),
  contact_email: Joi.string().required().trim().email().lowercase().max(255).messages({
    'string.empty': 'Contact email is required',
    'string.email': 'Contact email must be a valid email address',
    'string.max': 'Contact email cannot exceed 255 characters',
    'any.required': 'Contact email is required'
  }),
  description: Joi.string().trim().max(1000).allow('').messages({
    'string.max': 'Description cannot exceed 1000 characters'
  }),
  status: Joi.boolean().default(true).messages({
    'boolean.base': 'Status must be a boolean value'
  })
});

// Validation schema for updating vendor corporate client
const updateVendorCorporateClientSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  }),
  vendor_id: Joi.number().integer().min(1).messages({
    'number.base': 'Vendor ID must be a number',
    'number.integer': 'Vendor ID must be an integer',
    'number.min': 'Vendor ID must be greater than 0'
  }),
  company_name: Joi.string().trim().min(1).max(255).messages({
    'string.min': 'Company name must be at least 1 character long',
    'string.max': 'Company name cannot exceed 255 characters'
  }),
  industry: Joi.string().trim().min(1).max(255).messages({
    'string.min': 'Industry must be at least 1 character long',
    'string.max': 'Industry cannot exceed 255 characters'
  }),
  employee_count: Joi.number().integer().min(1).messages({
    'number.base': 'Employee count must be a number',
    'number.integer': 'Employee count must be an integer',
    'number.min': 'Employee count must be at least 1'
  }),
  contact_email: Joi.string().trim().email().lowercase().max(255).messages({
    'string.email': 'Contact email must be a valid email address',
    'string.max': 'Contact email cannot exceed 255 characters'
  }),
  description: Joi.string().trim().max(1000).allow('').messages({
    'string.max': 'Description cannot exceed 1000 characters'
  }),
  status: Joi.boolean().messages({
    'boolean.base': 'Status must be a boolean value'
  })
}).min(2).messages({
  'object.min': 'At least one field must be provided for update (excluding ID)'
});

// Validation schema for query parameters
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(255).allow(''),
  status: Joi.string().valid('true', 'false').allow(''),
  vendor_id: Joi.number().integer().min(1).allow('').messages({
    'number.base': 'Vendor ID must be a number',
    'number.integer': 'Vendor ID must be an integer',
    'number.min': 'Vendor ID must be greater than 0'
  }),
  industry: Joi.string().trim().max(255).allow('').messages({
    'string.max': 'Industry cannot exceed 255 characters'
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
  createVendorCorporateClientSchema,
  updateVendorCorporateClientSchema,
  querySchema,
  idSchema
};
