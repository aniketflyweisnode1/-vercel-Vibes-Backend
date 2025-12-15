const Joi = require('joi');

// Validation schema for creating event ticket seat
const createEventTicketSeatSchema = Joi.object({
  event_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0',
    'any.required': 'Event ID is required'
  }),
  tax_percentage: Joi.number().min(0).max(100).default(0).messages({
    'number.base': 'Tax percentage must be a number',
    'number.min': 'Tax percentage must be 0 or greater',
    'number.max': 'Tax percentage cannot exceed 100'
  }),
  coupon_code: Joi.string().trim().allow('', null).messages({
    'string.base': 'Coupon code must be a string'
  }),
  promo_code: Joi.string().trim().allow('', null).messages({
    'string.base': 'Promo code must be a string'
  }),
  firstName: Joi.string().trim().min(1).max(100).allow('', null).messages({
    'string.min': 'First name must be at least 1 character long',
    'string.max': 'First name cannot exceed 100 characters'
  }),
  lastName: Joi.string().trim().max(100).allow('').messages({
    'string.max': 'Last name cannot exceed 100 characters'
  }),
  email: Joi.string().trim().email().lowercase().allow('', null).messages({
    'string.email': 'Email must be a valid email address'
  }),
  phoneNo: Joi.string().trim().min(10).max(15).allow('', null).messages({
    'string.min': 'Phone number must be at least 10 characters long',
    'string.max': 'Phone number cannot exceed 15 characters'
  }),
  loyalty_points: Joi.boolean().default(false),
  tickets: Joi.array().items(
    Joi.object({
      event_entry_tickets_id: Joi.number().integer().min(1).required().messages({
        'number.base': 'Event entry tickets ID must be a number',
        'number.integer': 'Event entry tickets ID must be an integer',
        'number.min': 'Event entry tickets ID must be greater than 0',
        'any.required': 'Event entry tickets ID is required'
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
  }),
  status: Joi.boolean().default(true)
});

// Validation schema for updating event ticket seat
const updateEventTicketSeatSchema = Joi.object({
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
  tax_percentage: Joi.number().min(0).max(100).messages({
    'number.base': 'Tax percentage must be a number',
    'number.min': 'Tax percentage must be 0 or greater',
    'number.max': 'Tax percentage cannot exceed 100'
  }),
  coupon_code: Joi.string().trim().allow('', null).messages({
    'string.base': 'Coupon code must be a string'
  }),
  promo_code: Joi.string().trim().allow('', null).messages({
    'string.base': 'Promo code must be a string'
  }),
  firstName: Joi.string().trim().min(1).max(100).messages({
    'string.min': 'First name must be at least 1 character long',
    'string.max': 'First name cannot exceed 100 characters'
  }),
  lastName: Joi.string().trim().max(100).allow('').messages({
    'string.max': 'Last name cannot exceed 100 characters'
  }),
  email: Joi.string().trim().email().lowercase().messages({
    'string.email': 'Email must be a valid email address'
  }),
  phoneNo: Joi.string().trim().min(10).max(15).messages({
    'string.min': 'Phone number must be at least 10 characters long',
    'string.max': 'Phone number cannot exceed 15 characters'
  }),
  loyalty_points: Joi.boolean(),
  tickets: Joi.array().items(
    Joi.object({
      event_entry_tickets_id: Joi.number().integer().min(1).required().messages({
        'number.base': 'Event entry tickets ID must be a number',
        'number.integer': 'Event entry tickets ID must be an integer',
        'number.min': 'Event entry tickets ID must be greater than 0',
        'any.required': 'Event entry tickets ID is required'
      }),
      quantity: Joi.number().integer().min(1).required().messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be an integer',
        'number.min': 'Quantity must be at least 1',
        'any.required': 'Quantity is required'
      })
    })
  ).min(1).messages({
    'array.base': 'Tickets must be an array',
    'array.min': 'At least one ticket is required'
  }),
  status: Joi.boolean()
}).min(2).messages({
  'object.min': 'At least one field must be provided for update (excluding ID)'
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
  event_entry_tickets_id: Joi.number().integer().min(1).allow('').messages({
    'number.base': 'Event entry tickets ID must be a number',
    'number.integer': 'Event entry tickets ID must be an integer',
    'number.min': 'Event entry tickets ID must be greater than 0'
  }),
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
  createEventTicketSeatSchema,
  updateEventTicketSeatSchema,
  querySchema,
  idSchema
};

