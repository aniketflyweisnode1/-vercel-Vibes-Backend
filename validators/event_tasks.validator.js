const Joi = require('joi');

// Validation schema for creating event task
const createEventTaskSchema = Joi.object({
  event_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0',
    'any.required': 'Event ID is required'
  }),
  taskTitle: Joi.string().required().trim().min(1).max(255).messages({
    'string.empty': 'Task title is required',
    'string.min': 'Task title must be at least 1 character long',
    'string.max': 'Task title cannot exceed 255 characters',
    'any.required': 'Task title is required'
  }),
  description: Joi.string().trim().max(1000).allow('').messages({
    'string.max': 'Description cannot exceed 1000 characters'
  }),
  image: Joi.string().trim().uri().allow('').messages({
    'string.uri': 'Image must be a valid URL'
  }),
  emozi: Joi.string().trim().max(10).allow('').messages({
    'string.max': 'Emoji cannot exceed 10 characters'
  }),
  confirmFinalGuestCount: Joi.boolean().default(false),
  finalizeMusicPlaylist: Joi.boolean().default(false),
  setupDecorations: Joi.boolean().default(false),
  status: Joi.boolean().default(true)
});

// Validation schema for updating event task
const updateEventTaskSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  }),
  taskTitle: Joi.string().trim().min(1).max(255).messages({
    'string.min': 'Task title must be at least 1 character long',
    'string.max': 'Task title cannot exceed 255 characters'
  }),
  description: Joi.string().trim().max(1000).allow('').messages({
    'string.max': 'Description cannot exceed 1000 characters'
  }),
  image: Joi.string().trim().uri().allow('').messages({
    'string.uri': 'Image must be a valid URL'
  }),
  emozi: Joi.string().trim().max(10).allow('').messages({
    'string.max': 'Emoji cannot exceed 10 characters'
  }),
  confirmFinalGuestCount: Joi.boolean(),
  finalizeMusicPlaylist: Joi.boolean(),
  setupDecorations: Joi.boolean(),
  status: Joi.boolean()
}).min(2).messages({
  'object.min': 'At least one field must be provided for update (excluding ID)'
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
  createEventTaskSchema,
  updateEventTaskSchema,
  querySchema,
  idSchema,
  eventIdSchema
};
