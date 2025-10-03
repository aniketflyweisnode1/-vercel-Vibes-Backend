const Joi = require('joi');

const commonValidations = {
  marketplace_service_charges_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'MarketPlace Service Charges ID must be a number',
      'number.integer': 'MarketPlace Service Charges ID must be an integer',
      'number.positive': 'MarketPlace Service Charges ID must be a positive number',
      'any.required': 'MarketPlace Service Charges ID is required'
    }),

  event_start_date: Joi.date()
    .required()
    .messages({
      'date.base': 'Event start date is required and must be a valid date',
      'any.required': 'Event start date is required'
    }),

  event_end_date: Joi.date()
    .required()
    .min(Joi.ref('event_start_date'))
    .messages({
      'date.base': 'Event end date is required and must be a valid date',
      'date.min': 'Event end date must be after or equal to event start date',
      'any.required': 'Event end date is required'
    }),

  event_start_time: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Event start time is required',
      'any.required': 'Event start time is required'
    }),

  event_end_time: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Event end time is required',
      'any.required': 'Event end time is required'
    }),

  event_name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Event name is required',
      'string.min': 'Event name must be at least 2 characters long',
      'string.max': 'Event name cannot exceed 200 characters'
    }),

  event_address: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Event address is required',
      'string.min': 'Event address must be at least 10 characters long',
      'string.max': 'Event address cannot exceed 500 characters'
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

  no_of_guests: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Number of guests must be a number',
      'number.integer': 'Number of guests must be an integer',
      'number.min': 'Number of guests must be at least 1',
      'any.required': 'Number of guests is required'
    }),

  event_img: Joi.string()
    .trim()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Event image must be a valid URL'
    }),

  emozi: Joi.string()
    .trim()
    .max(10)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Emoji cannot exceed 10 characters'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

const createMarketPlaceBookingSchema = Joi.object({
  marketplace_service_charges_id: commonValidations.marketplace_service_charges_id,
  event_start_date: commonValidations.event_start_date,
  event_end_date: commonValidations.event_end_date,
  event_start_time: commonValidations.event_start_time,
  event_end_time: commonValidations.event_end_time,
  event_name: commonValidations.event_name,
  event_address: commonValidations.event_address,
  event_type_id: commonValidations.event_type_id,
  no_of_guests: commonValidations.no_of_guests,
  event_img: commonValidations.event_img,
  emozi: commonValidations.emozi,
  status: commonValidations.status
});

const updateMarketPlaceBookingSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Booking ID must be a number',
      'number.integer': 'Booking ID must be an integer',
      'number.positive': 'Booking ID must be a positive number',
      'any.required': 'Booking ID is required'
    }),
  marketplace_service_charges_id: commonValidations.marketplace_service_charges_id.optional(),
  event_start_date: commonValidations.event_start_date.optional(),
  event_end_date: commonValidations.event_end_date.optional(),
  event_start_time: commonValidations.event_start_time.optional(),
  event_end_time: commonValidations.event_end_time.optional(),
  event_name: commonValidations.event_name.optional(),
  event_address: commonValidations.event_address.optional(),
  event_type_id: commonValidations.event_type_id.optional(),
  no_of_guests: commonValidations.no_of_guests.optional(),
  event_img: commonValidations.event_img,
  emozi: commonValidations.emozi,
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field besides id must be provided for update'
});

const getMarketPlaceBookingByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Booking ID must be a number',
      'number.integer': 'Booking ID must be an integer',
      'number.positive': 'Booking ID must be a positive number'
    })
});

const getAllMarketPlaceBookingSchema = Joi.object({
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
  marketplace_service_charges_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'MarketPlace Service Charges ID must be a number',
      'number.integer': 'MarketPlace Service Charges ID must be an integer',
      'number.positive': 'MarketPlace Service Charges ID must be a positive number'
    }),
  event_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Event Type ID must be a number',
      'number.integer': 'Event Type ID must be an integer',
      'number.positive': 'Event Type ID must be a positive number'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  sortBy: Joi.string()
    .valid('event_name', 'event_start_date', 'no_of_guests', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: event_name, event_start_date, no_of_guests, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createMarketPlaceBookingSchema,
  updateMarketPlaceBookingSchema,
  getMarketPlaceBookingByIdSchema,
  getAllMarketPlaceBookingSchema
};

