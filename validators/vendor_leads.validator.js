const Joi = require('joi');

/**
 * Vendor Leads validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  Vendor_name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Vendor name is required',
      'string.min': 'Vendor name must be at least 2 characters long',
      'string.max': 'Vendor name cannot exceed 200 characters'
    }),

  platform: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Platform is required',
      'string.min': 'Platform must be at least 2 characters long',
      'string.max': 'Platform cannot exceed 100 characters'
    }),

  shop_Profile_url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please enter a valid URL starting with http:// or https://'
    }),

  product_serviceType: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Product/Service type is required',
      'string.min': 'Product/Service type must be at least 2 characters long',
      'string.max': 'Product/Service type cannot exceed 200 characters'
    }),

  ContactEmail: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Contact email is required',
      'string.email': 'Please enter a valid email address'
    }),

  ContactPhone: Joi.string()
    .pattern(/^[0-9+\-\s()]{10,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please enter a valid phone number'
    }),

  DiscoverySource: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Discovery source is required',
      'string.min': 'Discovery source must be at least 2 characters long',
      'string.max': 'Discovery source cannot exceed 100 characters'
    }),

  ContactMobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Contact mobile is required',
      'string.pattern.base': 'Please enter a valid 10-digit mobile number'
    }),

  EstimetedValuePrice: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Estimated value price must be a number',
      'number.min': 'Estimated value price cannot be negative'
    }),

  Tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .optional()
    .messages({
      'array.base': 'Tags must be an array',
      'string.max': 'Each tag cannot exceed 50 characters'
    }),

  Notes: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    }),

  LeadStatus: Joi.string()
    .valid('Active', 'Inactive')
    .default('Active')
    .messages({
      'any.only': 'Lead status must be either Active or Inactive'
    }),

  Status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create vendor leads validation schema
const createVendorLeadsSchema = Joi.object({
  Vendor_name: commonValidations.Vendor_name,
  platform: commonValidations.platform,
  shop_Profile_url: commonValidations.shop_Profile_url,
  product_serviceType: commonValidations.product_serviceType,
  ContactEmail: commonValidations.ContactEmail,
  ContactPhone: commonValidations.ContactPhone,
  DiscoverySource: commonValidations.DiscoverySource,
  ContactMobile: commonValidations.ContactMobile,
  EstimetedValuePrice: commonValidations.EstimetedValuePrice,
  Tags: commonValidations.Tags,
  Notes: commonValidations.Notes,
  LeadStatus: commonValidations.LeadStatus,
  Status: commonValidations.Status
});

// Update vendor leads validation schema
const updateVendorLeadsSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Vendor Leads ID must be a number',
      'number.integer': 'Vendor Leads ID must be an integer',
      'number.positive': 'Vendor Leads ID must be a positive number',
      'any.required': 'Vendor Leads ID is required'
    }),
  Vendor_name: commonValidations.Vendor_name.optional(),
  platform: commonValidations.platform.optional(),
  shop_Profile_url: commonValidations.shop_Profile_url.optional(),
  product_serviceType: commonValidations.product_serviceType.optional(),
  ContactEmail: commonValidations.ContactEmail.optional(),
  ContactPhone: commonValidations.ContactPhone.optional(),
  DiscoverySource: commonValidations.DiscoverySource.optional(),
  ContactMobile: commonValidations.ContactMobile.optional(),
  EstimetedValuePrice: commonValidations.EstimetedValuePrice.optional(),
  Tags: commonValidations.Tags.optional(),
  Notes: commonValidations.Notes.optional(),
  LeadStatus: commonValidations.LeadStatus.optional(),
  Status: commonValidations.Status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get vendor leads by ID validation schema
const getVendorLeadsByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Vendor Leads ID must be a number',
      'number.integer': 'Vendor Leads ID must be an integer',
      'number.positive': 'Vendor Leads ID must be a positive number'
    })
});

// Get all vendor leads query validation schema
const getAllVendorLeadsSchema = Joi.object({
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
  LeadStatus: Joi.string()
    .valid('Active', 'Inactive')
    .optional()
    .messages({
      'any.only': 'Lead status must be either Active or Inactive'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  sortBy: Joi.string()
    .valid('Vendor_name', 'ContactEmail', 'created_at', 'updated_at', 'LeadStatus', 'EstimetedValuePrice')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: Vendor_name, ContactEmail, created_at, updated_at, LeadStatus, EstimetedValuePrice'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Update vendor leads by ID with ID in body validation schema
const updateVendorLeadsByIdBodySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Vendor Leads ID must be a number',
      'number.integer': 'Vendor Leads ID must be an integer',
      'number.positive': 'Vendor Leads ID must be a positive number'
    }),
  Vendor_name: commonValidations.Vendor_name.optional(),
  platform: commonValidations.platform.optional(),
  shop_Profile_url: commonValidations.shop_Profile_url.optional(),
  product_serviceType: commonValidations.product_serviceType.optional(),
  ContactEmail: commonValidations.ContactEmail.optional(),
  ContactPhone: commonValidations.ContactPhone.optional(),
  DiscoverySource: commonValidations.DiscoverySource.optional(),
  ContactMobile: commonValidations.ContactMobile.optional(),
  EstimetedValuePrice: commonValidations.EstimetedValuePrice.optional(),
  Tags: commonValidations.Tags.optional(),
  Notes: commonValidations.Notes.optional(),
  LeadStatus: commonValidations.LeadStatus.optional(),
  Status: commonValidations.Status.optional()
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

module.exports = {
  createVendorLeadsSchema,
  updateVendorLeadsSchema,
  updateVendorLeadsByIdBodySchema,
  getVendorLeadsByIdSchema,
  getAllVendorLeadsSchema
};
