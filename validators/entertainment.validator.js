const Joi = require('joi');

const commonValidations = {
  entertainment_name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Entertainment name is required',
      'string.min': 'Entertainment name must be at least 2 characters long',
      'string.max': 'Entertainment name cannot exceed 200 characters'
    }),

  entertainment_price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Entertainment price must be a number',
      'number.min': 'Entertainment price must be a positive number',
      'any.required': 'Entertainment price is required'
    }),

  entertainment_type: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Entertainment type cannot exceed 100 characters'
    }),

  brand_name: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Brand name cannot exceed 200 characters'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

const createEntertainmentSchema = Joi.object({
  entertainment_name: commonValidations.entertainment_name,
  entertainment_price: commonValidations.entertainment_price,
  entertainment_type: commonValidations.entertainment_type,
  brand_name: commonValidations.brand_name,
  status: commonValidations.status
});

const updateEntertainmentSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Entertainment ID must be a number',
      'number.integer': 'Entertainment ID must be an integer',
      'number.positive': 'Entertainment ID must be a positive number',
      'any.required': 'Entertainment ID is required'
    }),
  entertainment_name: commonValidations.entertainment_name.optional(),
  entertainment_price: commonValidations.entertainment_price.optional(),
  entertainment_type: commonValidations.entertainment_type,
  brand_name: commonValidations.brand_name,
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field besides id must be provided for update'
});

const getEntertainmentByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Entertainment ID must be a number',
      'number.integer': 'Entertainment ID must be an integer',
      'number.positive': 'Entertainment ID must be a positive number'
    })
});

const getAllEntertainmentSchema = Joi.object({
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
  sortBy: Joi.string()
    .valid('entertainment_name', 'entertainment_price', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: entertainment_name, entertainment_price, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createEntertainmentSchema,
  updateEntertainmentSchema,
  getEntertainmentByIdSchema,
  getAllEntertainmentSchema
};

