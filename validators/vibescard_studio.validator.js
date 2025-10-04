const Joi = require('joi');

// Validation schema for creating vibes card studio
const createVibesCardStudioSchema = Joi.object({
  event_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0',
    'any.required': 'Event ID is required'
  }),
  category_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Category ID must be a number',
    'number.integer': 'Category ID must be an integer',
    'number.min': 'Category ID must be greater than 0',
    'any.required': 'Category ID is required'
  }),
  templates: Joi.string().trim().max(500).allow('').messages({
    'string.max': 'Templates cannot exceed 500 characters'
  }),
  colorScheme: Joi.string().trim().max(100).allow('').messages({
    'string.max': 'Color scheme cannot exceed 100 characters'
  }),
  canvas_size: Joi.string().trim().max(50).allow('').messages({
    'string.max': 'Canvas size cannot exceed 50 characters'
  }),
  zoomlevel: Joi.number().integer().min(10).max(500).default(100).messages({
    'number.min': 'Zoom level must be at least 10',
    'number.max': 'Zoom level cannot exceed 500',
    'number.integer': 'Zoom level must be an integer'
  }),
  status: Joi.boolean().default(true)
});

// Validation schema for updating vibes card studio
const updateVibesCardStudioSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  }),
  event_id: Joi.number().integer().min(1).messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0'
  }),
  category_id: Joi.number().integer().min(1).messages({
    'number.base': 'Category ID must be a number',
    'number.integer': 'Category ID must be an integer',
    'number.min': 'Category ID must be greater than 0'
  }),
  templates: Joi.string().trim().max(500).allow('').messages({
    'string.max': 'Templates cannot exceed 500 characters'
  }),
  colorScheme: Joi.string().trim().max(100).allow('').messages({
    'string.max': 'Color scheme cannot exceed 100 characters'
  }),
  canvas_size: Joi.string().trim().max(50).allow('').messages({
    'string.max': 'Canvas size cannot exceed 50 characters'
  }),
  zoomlevel: Joi.number().integer().min(10).max(500).messages({
    'number.min': 'Zoom level must be at least 10',
    'number.max': 'Zoom level cannot exceed 500',
    'number.integer': 'Zoom level must be an integer'
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
  event_id: Joi.number().integer().min(1).allow('').messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0'
  }),
  category_id: Joi.number().integer().min(1).allow('').messages({
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

// Validation schema for event ID parameter
const eventIdSchema = Joi.object({
  eventId: Joi.number().integer().min(1).required().messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0',
    'any.required': 'Event ID is required'
  })
});

module.exports = {
  createVibesCardStudioSchema,
  updateVibesCardStudioSchema,
  querySchema,
  idSchema,
  eventIdSchema
};
