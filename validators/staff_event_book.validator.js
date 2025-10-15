const Joi = require('joi');

/**
 * Staff Event Book validation schemas using Joi
 */

// Create staff event book validation schema
const createStaffEventBookSchema = Joi.object({
  event_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Event ID must be a number',
      'number.integer': 'Event ID must be an integer',
      'number.positive': 'Event ID must be a positive number',
      'any.required': 'Event ID is required'
    }),
  dateTo: Joi.date()
    .required()
    .messages({
      'date.base': 'Date To must be a valid date',
      'any.required': 'Date To is required'
    }),
  dateFrom: Joi.date()
    .required()
    .messages({
      'date.base': 'Date From must be a valid date',
      'any.required': 'Date From is required'
    }),
  timeTo: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Time To is required',
      'any.required': 'Time To is required'
    }),
  timeFrom: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Time From is required',
      'any.required': 'Time From is required'
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
  staff_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Staff ID must be a number',
      'number.integer': 'Staff ID must be an integer',
      'number.positive': 'Staff ID must be a positive number',
      'any.required': 'Staff ID is required'
    }),
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
  no_of_guests: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Number of Guests must be a number',
      'number.integer': 'Number of Guests must be an integer',
      'number.min': 'Number of Guests must be at least 1',
      'any.required': 'Number of Guests is required'
    }),
  special_instruction: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Special Instruction cannot exceed 1000 characters'
    }),
  transaction_status: Joi.string()
    .valid('Pending', 'Completed', 'Failed')
    .default('Pending')
    .optional()
    .messages({
      'any.only': 'Transaction Status must be one of: Pending, Completed, Failed'
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
  status: Joi.boolean()
    .default(true)
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update staff event book validation schema
const updateStaffEventBookSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Staff Event Book ID must be a number',
      'number.integer': 'Staff Event Book ID must be an integer',
      'number.positive': 'Staff Event Book ID must be a positive number',
      'any.required': 'Staff Event Book ID is required'
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
  dateTo: Joi.date()
    .optional()
    .messages({
      'date.base': 'Date To must be a valid date'
    }),
  dateFrom: Joi.date()
    .optional()
    .messages({
      'date.base': 'Date From must be a valid date'
    }),
  timeTo: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.empty': 'Time To cannot be empty'
    }),
  timeFrom: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.empty': 'Time From cannot be empty'
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
  staff_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Staff ID must be a number',
      'number.integer': 'Staff ID must be an integer',
      'number.positive': 'Staff ID must be a positive number'
    }),
  event_name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Event Name must be at least 2 characters long',
      'string.max': 'Event Name cannot exceed 200 characters'
    }),
  event_address: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .optional()
    .messages({
      'string.min': 'Event Address must be at least 5 characters long',
      'string.max': 'Event Address cannot exceed 500 characters'
    }),
  no_of_guests: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'Number of Guests must be a number',
      'number.integer': 'Number of Guests must be an integer',
      'number.min': 'Number of Guests must be at least 1'
    }),
  special_instruction: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Special Instruction cannot exceed 1000 characters'
    }),
  transaction_status: Joi.string()
    .valid('Pending', 'Completed', 'Failed')
    .optional()
    .messages({
      'any.only': 'Transaction Status must be one of: Pending, Completed, Failed'
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
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

// Get staff event book by ID validation schema
const getStaffEventBookByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Staff Event Book ID must be a number',
      'number.integer': 'Staff Event Book ID must be an integer',
      'number.positive': 'Staff Event Book ID must be a positive number',
      'any.required': 'Staff Event Book ID is required'
    })
});

module.exports = {
  createStaffEventBookSchema,
  updateStaffEventBookSchema,
  getStaffEventBookByIdSchema
};

