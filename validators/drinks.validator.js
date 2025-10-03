const Joi = require('joi');

const commonValidations = {
  drinks_name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Drinks name is required',
      'string.min': 'Drinks name must be at least 2 characters long',
      'string.max': 'Drinks name cannot exceed 200 characters'
    }),

  drinks_price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Drinks price must be a number',
      'number.min': 'Drinks price must be a positive number',
      'any.required': 'Drinks price is required'
    }),

  drinks_color: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Drinks color cannot exceed 50 characters'
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

const createDrinksSchema = Joi.object({
  drinks_name: commonValidations.drinks_name,
  drinks_price: commonValidations.drinks_price,
  drinks_color: commonValidations.drinks_color,
  brand_name: commonValidations.brand_name,
  status: commonValidations.status
});

const updateDrinksSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Drinks ID must be a number',
      'number.integer': 'Drinks ID must be an integer',
      'number.positive': 'Drinks ID must be a positive number',
      'any.required': 'Drinks ID is required'
    }),
  drinks_name: commonValidations.drinks_name.optional(),
  drinks_price: commonValidations.drinks_price.optional(),
  drinks_color: commonValidations.drinks_color,
  brand_name: commonValidations.brand_name,
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field besides id must be provided for update'
});

const getDrinksByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Drinks ID must be a number',
      'number.integer': 'Drinks ID must be an integer',
      'number.positive': 'Drinks ID must be a positive number'
    })
});

const getAllDrinksSchema = Joi.object({
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
    .valid('drinks_name', 'drinks_price', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: drinks_name, drinks_price, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createDrinksSchema,
  updateDrinksSchema,
  getDrinksByIdSchema,
  getAllDrinksSchema
};

