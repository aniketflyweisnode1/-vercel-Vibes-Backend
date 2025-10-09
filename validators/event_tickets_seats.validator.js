const Joi = require('joi');

// Validation schema for creating event ticket seat
const createEventTicketSeatSchema = Joi.object({
  event_entry_tickets_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Event entry tickets ID must be a number',
    'number.integer': 'Event entry tickets ID must be an integer',
    'number.min': 'Event entry tickets ID must be greater than 0',
    'any.required': 'Event entry tickets ID is required'
  }),
  event_entry_userget_tickets_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Event entry userget tickets ID must be a number',
    'number.integer': 'Event entry userget tickets ID must be an integer',
    'number.min': 'Event entry userget tickets ID must be greater than 0',
    'any.required': 'Event entry userget tickets ID is required'
  }),
  event_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0',
    'any.required': 'Event ID is required'
  }),
  seat_no: Joi.string().trim().allow('').messages({
    'string.base': 'Seat number must be a string'
  }),
  firstName: Joi.string().required().trim().min(1).max(100).messages({
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 1 character long',
    'string.max': 'First name cannot exceed 100 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().trim().max(100).allow('').messages({
    'string.max': 'Last name cannot exceed 100 characters'
  }),
  email: Joi.string().required().trim().email().lowercase().messages({
    'string.empty': 'Email is required',
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  }),
  phoneNo: Joi.string().required().trim().min(10).max(15).messages({
    'string.empty': 'Phone number is required',
    'string.min': 'Phone number must be at least 10 characters long',
    'string.max': 'Phone number cannot exceed 15 characters',
    'any.required': 'Phone number is required'
  }),
  promo_code: Joi.string().trim().allow('').messages({
    'string.base': 'Promo code must be a string'
  }),
  loyalty_points: Joi.boolean().default(false),
  capacity: Joi.number().integer().min(1).messages({
    'number.base': 'Capacity must be a number',
    'number.integer': 'Capacity must be an integer',
    'number.min': 'Capacity must be at least 1'
  }),
  type: Joi.string().trim().allow('').messages({
    'string.base': 'Type must be a string'
  }),
  map: Joi.string().trim().allow('').messages({
    'string.base': 'Map must be a string'
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
  event_entry_tickets_id: Joi.number().integer().min(1).messages({
    'number.base': 'Event entry tickets ID must be a number',
    'number.integer': 'Event entry tickets ID must be an integer',
    'number.min': 'Event entry tickets ID must be greater than 0'
  }),
  event_entry_userget_tickets_id: Joi.number().integer().min(1).messages({
    'number.base': 'Event entry userget tickets ID must be a number',
    'number.integer': 'Event entry userget tickets ID must be an integer',
    'number.min': 'Event entry userget tickets ID must be greater than 0'
  }),
  event_id: Joi.number().integer().min(1).messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0'
  }),
  seat_no: Joi.string().trim().allow(''),
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
  promo_code: Joi.string().trim().allow(''),
  loyalty_points: Joi.boolean(),
  capacity: Joi.number().integer().min(1).messages({
    'number.base': 'Capacity must be a number',
    'number.integer': 'Capacity must be an integer',
    'number.min': 'Capacity must be at least 1'
  }),
  type: Joi.string().trim().allow(''),
  map: Joi.string().trim().allow(''),
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
  event_entry_userget_tickets_id: Joi.number().integer().min(1).allow('').messages({
    'number.base': 'Event entry userget tickets ID must be a number',
    'number.integer': 'Event entry userget tickets ID must be an integer',
    'number.min': 'Event entry userget tickets ID must be greater than 0'
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

module.exports = {
  createEventTicketSeatSchema,
  updateEventTicketSeatSchema,
  querySchema,
  idSchema
};

