const Joi = require('joi');

/**
 * Catering Marketplace Booking validation schemas using Joi
 */

// Create catering marketplace booking validation schema
const createCateringMarketplaceBookingSchema = Joi.object({
  event_name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Event Name is required',
      'string.min': 'Event Name must be at least 2 characters long',
      'string.max': 'Event Name cannot exceed 200 characters',
      'any.required': 'Event Name is required'
    }),
  event_address: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Event Address is required',
      'string.min': 'Event Address must be at least 5 characters long',
      'string.max': 'Event Address cannot exceed 500 characters',
      'any.required': 'Event Address is required'
    }),
  event_type_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Event Type ID must be a number',
      'number.integer': 'Event Type ID must be an integer',
      'number.positive': 'Event Type ID must be a positive number',
      'any.required': 'Event Type ID is required'
    }),
  catering_marketplace_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Catering Marketplace ID must be a number',
      'number.integer': 'Catering Marketplace ID must be an integer',
      'number.positive': 'Catering Marketplace ID must be a positive number',
      'any.required': 'Catering Marketplace ID is required'
    }),
  event_to_date: Joi.date()
    .required()
    .messages({
      'date.base': 'Event To Date must be a valid date',
      'any.required': 'Event To Date is required'
    }),
  event_from_date: Joi.date()
    .required()
    .messages({
      'date.base': 'Event From Date must be a valid date',
      'any.required': 'Event From Date is required'
    }),
  event_to_time: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Event To Time is required',
      'any.required': 'Event To Time is required'
    }),
  event_from_time: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Event From Time is required',
      'any.required': 'Event From Time is required'
    }),
  guest_count: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Guest Count must be a number',
      'number.integer': 'Guest Count must be an integer',
      'number.min': 'Guest Count must be at least 1',
      'any.required': 'Guest Count is required'
    }),
  amount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Amount must be a number',
      'number.min': 'Amount cannot be negative'
    }),
  venue_details_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Venue Details ID must be a number',
      'number.integer': 'Venue Details ID must be an integer',
      'number.positive': 'Venue Details ID must be a positive number'
    }),
  max_capacity: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'Max Capacity must be a number',
      'number.integer': 'Max Capacity must be an integer',
      'number.min': 'Max Capacity must be at least 1'
    })
});

// Update catering marketplace booking validation schema
const updateCateringMarketplaceBookingSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Catering Marketplace Booking ID must be a number',
      'number.integer': 'Catering Marketplace Booking ID must be an integer',
      'number.positive': 'Catering Marketplace Booking ID must be a positive number',
      'any.required': 'Catering Marketplace Booking ID is required'
    }),
  catering_marketplace_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Catering Marketplace ID must be a number',
      'number.integer': 'Catering Marketplace ID must be an integer',
      'number.positive': 'Catering Marketplace ID must be a positive number'
    }),
  event_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Event ID must be a number',
      'number.integer': 'Event ID must be an integer',
      'number.positive': 'Event ID must be a positive number'
    }),
  event_to_date: Joi.date()
    .optional()
    .messages({
      'date.base': 'Event To Date must be a valid date'
    }),
  event_from_date: Joi.date()
    .optional()
    .messages({
      'date.base': 'Event From Date must be a valid date'
    }),
  event_to_time: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.empty': 'Event To Time cannot be empty'
    }),
  event_from_time: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.empty': 'Event From Time cannot be empty'
    }),
  guest_count: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'Guest Count must be a number',
      'number.integer': 'Guest Count must be an integer',
      'number.min': 'Guest Count must be at least 1'
    }),
  transaction_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Transaction ID must be a number',
      'number.integer': 'Transaction ID must be an integer',
      'number.positive': 'Transaction ID must be a positive number'
    }),
  transaction_status: Joi.string()
    .valid('Pending', 'Completed', 'Failed')
    .optional()
    .messages({
      'any.only': 'Transaction Status must be one of: Pending, Completed, Failed'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

// Get catering marketplace booking by ID validation schema
const getCateringMarketplaceBookingByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Catering Marketplace Booking ID must be a number',
      'number.integer': 'Catering Marketplace Booking ID must be an integer',
      'number.positive': 'Catering Marketplace Booking ID must be a positive number',
      'any.required': 'Catering Marketplace Booking ID is required'
    })
});

module.exports = {
  createCateringMarketplaceBookingSchema,
  updateCateringMarketplaceBookingSchema,
  getCateringMarketplaceBookingByIdSchema
};
