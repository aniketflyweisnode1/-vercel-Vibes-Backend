const Joi = require('joi');

// Validation schema for creating item category
const createItemCategorySchema = Joi.object({
  categorytxt: Joi.string().required().trim().min(1).max(255).messages({
    'string.empty': 'Category text is required',
    'string.min': 'Category text must be at least 1 character long',
    'string.max': 'Category text cannot exceed 255 characters',
    'any.required': 'Category text is required'
  }),
  emozi: Joi.string().trim().max(10).allow('').messages({
    'string.max': 'Emoji cannot exceed 10 characters'
  }),
  status: Joi.boolean().default(true)
});

// Validation schema for updating item category
const updateItemCategorySchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  }),
  categorytxt: Joi.string().trim().min(1).max(255).messages({
    'string.min': 'Category text must be at least 1 character long',
    'string.max': 'Category text cannot exceed 255 characters'
  }),
  emozi: Joi.string().trim().max(10).allow('').messages({
    'string.max': 'Emoji cannot exceed 10 characters'
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
  status: Joi.string().valid('true', 'false').allow('')
});

// Validation schema for ID parameter
const idSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'number.base': 'Item category ID must be a number',
    'number.integer': 'Item category ID must be an integer',
    'any.required': 'Item category ID is required'
  })
});

module.exports = {
  createItemCategorySchema,
  updateItemCategorySchema,
  querySchema,
  idSchema
};
