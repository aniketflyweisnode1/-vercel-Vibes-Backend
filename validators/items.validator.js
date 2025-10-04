const Joi = require('joi');

// Validation schema for creating item
const createItemsSchema = Joi.object({
  item_Category_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Category ID must be a number',
    'number.integer': 'Category ID must be an integer',
    'number.min': 'Category ID must be greater than 0',
    'any.required': 'Category ID is required'
  }),
  item_name: Joi.string().required().trim().min(1).max(255).messages({
    'string.empty': 'Item name is required',
    'string.min': 'Item name must be at least 1 character long',
    'string.max': 'Item name cannot exceed 255 characters',
    'any.required': 'Item name is required'
  }),
  item_price: Joi.number().required().min(0).messages({
    'number.min': 'Item price must be greater than or equal to 0',
    'any.required': 'Item price is required'
  }),
  item_brand: Joi.string().required().trim().min(1).max(255).messages({
    'string.empty': 'Item brand is required',
    'string.min': 'Item brand must be at least 1 character long',
    'string.max': 'Item brand cannot exceed 255 characters',
    'any.required': 'Item brand is required'
  }),
  item_color: Joi.string().required().trim().min(1).max(100).messages({
    'string.empty': 'Item color is required',
    'string.min': 'Item color must be at least 1 character long',
    'string.max': 'Item color cannot exceed 100 characters',
    'any.required': 'Item color is required'
  }),
  status: Joi.boolean().default(true)
});

// Validation schema for updating item
const updateItemsSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  }),
  item_Category_id: Joi.number().integer().min(1).messages({
    'number.base': 'Category ID must be a number',
    'number.integer': 'Category ID must be an integer',
    'number.min': 'Category ID must be greater than 0'
  }),
  item_name: Joi.string().trim().min(1).max(255).messages({
    'string.min': 'Item name must be at least 1 character long',
    'string.max': 'Item name cannot exceed 255 characters'
  }),
  item_price: Joi.number().min(0).messages({
    'number.min': 'Item price must be greater than or equal to 0'
  }),
  item_brand: Joi.string().trim().min(1).max(255).messages({
    'string.min': 'Item brand must be at least 1 character long',
    'string.max': 'Item brand cannot exceed 255 characters'
  }),
  item_color: Joi.string().trim().min(1).max(100).messages({
    'string.min': 'Item color must be at least 1 character long',
    'string.max': 'Item color cannot exceed 100 characters'
  }),
  status: Joi.boolean()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation schema for query parameters
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(255).allow(''),
  status: Joi.string().valid('true', 'false').allow(''),
  item_Category_id: Joi.number().integer().min(1).allow('').messages({
    'number.base': 'Category ID must be a number',
    'number.integer': 'Category ID must be an integer',
    'number.min': 'Category ID must be greater than 0'
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

// Validation schema for category ID parameter
const categoryIdSchema = Joi.object({
  categoryId: Joi.number().integer().min(1).required().messages({
    'number.base': 'Category ID must be a number',
    'number.integer': 'Category ID must be an integer',
    'number.min': 'Category ID must be greater than 0',
    'any.required': 'Category ID is required'
  })
});

module.exports = {
  createItemsSchema,
  updateItemsSchema,
  querySchema,
  idSchema,
  categoryIdSchema
};
