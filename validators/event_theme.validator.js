const Joi = require('joi');

const commonValidations = {
  event_theme_name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Event Theme name is required',
      'string.min': 'Event Theme name must be at least 2 characters long',
      'string.max': 'Event Theme name cannot exceed 200 characters'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

const createEventThemeSchema = Joi.object({
  event_theme_name: commonValidations.event_theme_name,
  status: commonValidations.status
});

const updateEventThemeSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Event Theme ID must be a number',
      'number.integer': 'Event Theme ID must be an integer',
      'number.positive': 'Event Theme ID must be a positive number',
      'any.required': 'Event Theme ID is required'
    }),
  event_theme_name: commonValidations.event_theme_name.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field besides id must be provided for update'
});

const getEventThemeByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Event Theme ID must be a number',
      'number.integer': 'Event Theme ID must be an integer',
      'number.positive': 'Event Theme ID must be a positive number'
    })
});

const getAllEventThemeSchema = Joi.object({
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
    .valid('event_theme_name', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: event_theme_name, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createEventThemeSchema,
  updateEventThemeSchema,
  getEventThemeByIdSchema,
  getAllEventThemeSchema
};

