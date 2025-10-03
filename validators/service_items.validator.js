const Joi = require('joi');

/**
 * Service Items validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  vendor_service_type_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Vendor Service Type ID must be a number',
      'number.integer': 'Vendor Service Type ID must be an integer',
      'number.positive': 'Vendor Service Type ID must be a positive number',
      'any.required': 'Vendor Service Type ID is required'
    }),

  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),

  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),

  item_image: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Item image URL cannot exceed 500 characters'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create service item validation schema
const createServiceItemSchema = Joi.object({
  vendor_service_type_id: commonValidations.vendor_service_type_id,
  name: commonValidations.name,
  description: commonValidations.description,
  item_image: commonValidations.item_image,
  status: commonValidations.status
});

// Update service item validation schema
const updateServiceItemSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Service Item ID must be a number',
      'number.integer': 'Service Item ID must be an integer',
      'number.positive': 'Service Item ID must be a positive number'
    }),
  vendor_service_type_id: commonValidations.vendor_service_type_id.optional(),
  name: commonValidations.name.optional(),
  description: commonValidations.description.optional(),
  item_image: commonValidations.item_image.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get service item by ID validation schema
const getServiceItemByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Service Item ID must be a number',
      'number.integer': 'Service Item ID must be an integer',
      'number.positive': 'Service Item ID must be a positive number'
    })
});

// Get all service items query validation schema
const getAllServiceItemsSchema = Joi.object({
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
  vendor_service_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Vendor Service Type ID must be a number',
      'number.integer': 'Vendor Service Type ID must be an integer',
      'number.positive': 'Vendor Service Type ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('name', 'description', 'vendor_service_type_id', 'status', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: name, description, vendor_service_type_id, status, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createServiceItemSchema,
  updateServiceItemSchema,
  getServiceItemByIdSchema,
  getAllServiceItemsSchema
};
