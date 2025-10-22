const Joi = require('joi');

/**
 * Email Template validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  vendor_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Vendor ID must be a number',
      'number.integer': 'Vendor ID must be an integer',
      'number.positive': 'Vendor ID must be a positive number',
      'any.required': 'Vendor ID is required'
    }),

  Title: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 2 characters long',
      'string.max': 'Title cannot exceed 200 characters'
    }),

  subTitle: Joi.string()
    .trim()
    .max(300)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Subtitle cannot exceed 300 characters'
    }),

  Subject: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Subject is required',
      'string.min': 'Subject must be at least 2 characters long',
      'string.max': 'Subject cannot exceed 200 characters'
    }),

  Preview: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Preview cannot exceed 1000 characters'
    }),

  defultTemplate: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Default template must be a boolean value'
    }),

  image: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please enter a valid URL starting with http:// or https://'
    }),

  Status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create email template validation schema
const createEmailTemplateSchema = Joi.object({
  vendor_id: commonValidations.vendor_id,
  Title: commonValidations.Title,
  subTitle: commonValidations.subTitle,
  Subject: commonValidations.Subject,
  Preview: commonValidations.Preview,
  defultTemplate: commonValidations.defultTemplate,
  image: commonValidations.image,
  Status: commonValidations.Status
});

// Update email template validation schema
const updateEmailTemplateSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Email Template ID must be a number',
      'number.integer': 'Email Template ID must be an integer',
      'number.positive': 'Email Template ID must be a positive number',
      'any.required': 'Email Template ID is required'
    }),
  vendor_id: commonValidations.vendor_id.optional(),
  Title: commonValidations.Title.optional(),
  subTitle: commonValidations.subTitle.optional(),
  Subject: commonValidations.Subject.optional(),
  Preview: commonValidations.Preview.optional(),
  defultTemplate: commonValidations.defultTemplate.optional(),
  image: commonValidations.image.optional(),
  Status: commonValidations.Status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get email template by ID validation schema
const getEmailTemplateByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Email Template ID must be a number',
      'number.integer': 'Email Template ID must be an integer',
      'number.positive': 'Email Template ID must be a positive number'
    })
});

// Get all email templates query validation schema
const getAllEmailTemplateSchema = Joi.object({
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
  vendor_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Vendor ID must be a number',
      'number.integer': 'Vendor ID must be an integer',
      'number.positive': 'Vendor ID must be a positive number'
    }),
  defultTemplate: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Default template must be a boolean value'
    }),
  Status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  sortBy: Joi.string()
    .valid('Title', 'Subject', 'created_at', 'updated_at', 'defultTemplate')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: Title, Subject, created_at, updated_at, defultTemplate'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Update email template by ID with ID in body validation schema
const updateEmailTemplateByIdBodySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Email Template ID must be a number',
      'number.integer': 'Email Template ID must be an integer',
      'number.positive': 'Email Template ID must be a positive number'
    }),
  vendor_id: commonValidations.vendor_id.optional(),
  Title: commonValidations.Title.optional(),
  subTitle: commonValidations.subTitle.optional(),
  Subject: commonValidations.Subject.optional(),
  Preview: commonValidations.Preview.optional(),
  defultTemplate: commonValidations.defultTemplate.optional(),
  image: commonValidations.image.optional(),
  Status: commonValidations.Status.optional()
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

module.exports = {
  createEmailTemplateSchema,
  updateEmailTemplateSchema,
  updateEmailTemplateByIdBodySchema,
  getEmailTemplateByIdSchema,
  getAllEmailTemplateSchema
};
