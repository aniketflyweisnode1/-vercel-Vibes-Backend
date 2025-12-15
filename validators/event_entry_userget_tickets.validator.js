const Joi = require('joi');

// Validation schema for creating event entry userget ticket
const createEventEntryUsergetTicketSchema = Joi.object({
  event_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0',
    'any.required': 'Event ID is required'
  }),
  tickets: Joi.array().items(
    Joi.object({
      event_entry_tickets_id: Joi.number().integer().min(1).messages({
        'number.base': 'Event entry tickets ID must be a number',
        'number.integer': 'Event entry tickets ID must be an integer',
        'number.min': 'Event entry tickets ID must be greater than 0'
      }),
      quantity: Joi.number().integer().min(1).required().messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.min': 'Quantity must be at least 1',
        'any.required': 'Quantity is required'
      })
    })
  ).min(1).required().messages({
    'array.base': 'Tickets must be an array',
    'array.min': 'At least one ticket is required',
    'any.required': 'Tickets array is required'
  })
});

// Validation schema for updating event entry userget ticket
const updateEventEntryUsergetTicketSchema = Joi.object({
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
  tickets: Joi.array().items(
    Joi.object({
      event_entry_tickets_id: Joi.number().integer().min(1).messages({
        'number.base': 'Event entry tickets ID must be a number',
        'number.integer': 'Event entry tickets ID must be an integer',
        'number.min': 'Event entry tickets ID must be greater than 0'
      }),
      quantity: Joi.number().integer().min(1).messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.min': 'Quantity must be at least 1'
      })
    })
  ).min(1).messages({
    'array.base': 'Tickets must be an array',
    'array.min': 'At least one ticket is required'
  })
}).min(2).messages({
  'object.min': 'At least one field must be provided for update (excluding ID)'
});

// Validation schema for query parameters
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
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
  createEventEntryUsergetTicketSchema,
  updateEventEntryUsergetTicketSchema,
  querySchema,
  idSchema,
  eventIdSchema
};

