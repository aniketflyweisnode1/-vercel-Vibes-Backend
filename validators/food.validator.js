const Joi = require('joi');

const commonValidations = {
  food_name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Food name is required',
      'string.min': 'Food name must be at least 2 characters long',
      'string.max': 'Food name cannot exceed 200 characters'
    }),

  food_price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Food price must be a number',
      'number.min': 'Food price must be a positive number',
      'any.required': 'Food price is required'
    }),

  food_color: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Food color cannot exceed 50 characters'
    }),

  food_type: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Food type cannot exceed 100 characters'
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

const createFoodSchema = Joi.object({
  food_name: commonValidations.food_name,
  food_price: commonValidations.food_price,
  food_color: commonValidations.food_color,
  food_type: commonValidations.food_type,
  brand_name: commonValidations.brand_name,
  status: commonValidations.status
});

const updateFoodSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Food ID must be a number',
      'number.integer': 'Food ID must be an integer',
      'number.positive': 'Food ID must be a positive number',
      'any.required': 'Food ID is required'
    }),
  food_name: commonValidations.food_name.optional(),
  food_price: commonValidations.food_price.optional(),
  food_color: commonValidations.food_color,
  food_type: commonValidations.food_type,
  brand_name: commonValidations.brand_name,
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field besides id must be provided for update'
});

const getFoodByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Food ID must be a number',
      'number.integer': 'Food ID must be an integer',
      'number.positive': 'Food ID must be a positive number'
    })
});

const getAllFoodSchema = Joi.object({
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
    .valid('food_name', 'food_price', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: food_name, food_price, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createFoodSchema,
  updateFoodSchema,
  getFoodByIdSchema,
  getAllFoodSchema
};

