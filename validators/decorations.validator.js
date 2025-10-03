const Joi = require('joi');

const commonValidations = {
  decorations_name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Decorations name is required',
      'string.min': 'Decorations name must be at least 2 characters long',
      'string.max': 'Decorations name cannot exceed 200 characters'
    }),

  decorations_price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Decorations price must be a number',
      'number.min': 'Decorations price must be a positive number',
      'any.required': 'Decorations price is required'
    }),

  decorations_type: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Decorations type cannot exceed 100 characters'
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

const createDecorationsSchema = Joi.object({
  decorations_name: commonValidations.decorations_name,
  decorations_price: commonValidations.decorations_price,
  decorations_type: commonValidations.decorations_type,
  brand_name: commonValidations.brand_name,
  status: commonValidations.status
});

const updateDecorationsSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Decorations ID must be a number',
      'number.integer': 'Decorations ID must be an integer',
      'number.positive': 'Decorations ID must be a positive number',
      'any.required': 'Decorations ID is required'
    }),
  decorations_name: commonValidations.decorations_name.optional(),
  decorations_price: commonValidations.decorations_price.optional(),
  decorations_type: commonValidations.decorations_type,
  brand_name: commonValidations.brand_name,
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field besides id must be provided for update'
});

const getDecorationsByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Decorations ID must be a number',
      'number.integer': 'Decorations ID must be an integer',
      'number.positive': 'Decorations ID must be a positive number'
    })
});

const getAllDecorationsSchema = Joi.object({
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
    .valid('decorations_name', 'decorations_price', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: decorations_name, decorations_price, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createDecorationsSchema,
  updateDecorationsSchema,
  getDecorationsByIdSchema,
  getAllDecorationsSchema
};

