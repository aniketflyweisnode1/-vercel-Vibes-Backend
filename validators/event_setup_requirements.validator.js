const Joi = require('joi');

// Validation schema for creating event setup requirement
const createEventSetupRequirementSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(255).messages({
    'string.empty': 'Setup requirement name is required',
    'string.min': 'Setup requirement name must be at least 1 character long',
    'string.max': 'Setup requirement name cannot exceed 255 characters',
    'any.required': 'Setup requirement name is required'
  }),
  quantity: Joi.number().required().integer().min(1).messages({
    'number.min': 'Quantity must be at least 1',
    'number.integer': 'Quantity must be an integer',
    'any.required': 'Quantity is required'
  }),
  image: Joi.string().trim().uri().allow('').messages({
    'string.uri': 'Image must be a valid URL'
  }),
  emozi: Joi.string().trim().max(10).allow('').messages({
    'string.max': 'Emoji cannot exceed 10 characters'
  }),
  status: Joi.boolean().default(true)
});

// Validation schema for updating event setup requirement
const updateEventSetupRequirementSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).messages({
    'string.min': 'Setup requirement name must be at least 1 character long',
    'string.max': 'Setup requirement name cannot exceed 255 characters'
  }),
  quantity: Joi.number().integer().min(1).messages({
    'number.min': 'Quantity must be at least 1',
    'number.integer': 'Quantity must be an integer'
  }),
  image: Joi.string().trim().uri().allow('').messages({
    'string.uri': 'Image must be a valid URL'
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
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  })
});

module.exports = {
  createEventSetupRequirementSchema,
  updateEventSetupRequirementSchema,
  querySchema,
  idSchema
};
