const Joi = require('joi');

// Validation schema for items array
const itemSchema = Joi.object({
  item_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Item ID must be a number',
    'number.integer': 'Item ID must be an integer',
    'number.min': 'Item ID must be greater than 0',
    'any.required': 'Item ID is required'
  }),
  category_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Category ID must be a number',
    'number.integer': 'Category ID must be an integer',
    'number.min': 'Category ID must be greater than 0',
    'any.required': 'Category ID is required'
  }),
  price: Joi.number().required().min(0).messages({
    'number.min': 'Price must be greater than or equal to 0',
    'any.required': 'Price is required'
  })
});

// Validation schema for creating budget items
const createBudgetItemsSchema = Joi.object({
  items: Joi.array().items(itemSchema).min(1).required().messages({
    'array.min': 'At least one item is required',
    'any.required': 'Items array is required'
  }),
  status: Joi.boolean().default(true)
});

// Validation schema for updating budget items
const updateBudgetItemsSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  }),
  items: Joi.any().optional().allow(null).custom((value, helpers) => {
    // Allow null, undefined, or empty array
    if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
      return value;
    }
    return value;
  }),
  status: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation schema for query parameters
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('true', 'false').allow('')
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
  createBudgetItemsSchema,
  updateBudgetItemsSchema,
  querySchema,
  idSchema
};
