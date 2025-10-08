const Joi = require('joi');

// Validation schema for creating event discussion chat
const createEventDiscussionChatSchema = Joi.object({
  event_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0',
    'any.required': 'Event ID is required'
  }),
  user_id: Joi.number().integer().min(1).messages({
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'number.min': 'User ID must be greater than 0'
  }),
  message: Joi.string().required().trim().min(1).max(1000).messages({
    'string.empty': 'Message is required',
    'string.min': 'Message must be at least 1 character long',
    'string.max': 'Message cannot exceed 1000 characters',
    'any.required': 'Message is required'
  }),
  message_type: Joi.string().valid('text', 'image', 'file', 'link').default('text').messages({
    'any.only': 'Message type must be one of: text, image, file, link'
  }),
  file_url: Joi.string().trim().uri().allow('').messages({
    'string.uri': 'File URL must be a valid URL'
  }),
  reply_to: Joi.number().integer().min(1).allow(null).messages({
    'number.base': 'Reply to must be a number',
    'number.integer': 'Reply to must be an integer',
    'number.min': 'Reply to must be greater than 0'
  }),
  status: Joi.boolean().default(true)
});

// Validation schema for updating event discussion chat
const updateEventDiscussionChatSchema = Joi.object({
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
  message: Joi.string().trim().min(1).max(1000).messages({
    'string.min': 'Message must be at least 1 character long',
    'string.max': 'Message cannot exceed 1000 characters'
  }),
  message_type: Joi.string().valid('text', 'image', 'file', 'link').messages({
    'any.only': 'Message type must be one of: text, image, file, link'
  }),
  file_url: Joi.string().trim().uri().allow('').messages({
    'string.uri': 'File URL must be a valid URL'
  }),
  reply_to: Joi.number().integer().min(1).allow(null).messages({
    'number.base': 'Reply to must be a number',
    'number.integer': 'Reply to must be an integer',
    'number.min': 'Reply to must be greater than 0'
  }),
  is_edited: Joi.boolean(),
  edited_at: Joi.date().allow(null),
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
  })
});

// Validation schema for ID parameter
const idSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Event discussion chat ID must be a number',
    'number.integer': 'Event discussion chat ID must be an integer',
    'number.min': 'Event discussion chat ID must be greater than 0',
    'any.required': 'Event discussion chat ID is required'
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
  createEventDiscussionChatSchema,
  updateEventDiscussionChatSchema,
  querySchema,
  idSchema,
  eventIdSchema
};
