const Joi = require('joi');

const createAvailabilityCalenderSchema = Joi.object({
  Year: Joi.number().integer().required().messages({
    'any.required': 'Year is required',
    'number.base': 'Year must be a number'
  }),
  Month: Joi.number().integer().min(1).max(12).required().messages({
    'any.required': 'Month is required',
    'number.base': 'Month must be a number',
    'number.min': 'Month must be between 1 and 12',
    'number.max': 'Month must be between 1 and 12'
  }),
  Date_start: Joi.date().required().messages({
    'any.required': 'Date_start is required',
    'date.base': 'Date_start must be a valid date'
  }),
  Start_time: Joi.string().trim().optional().allow('', null),
  End_time: Joi.string().trim().optional().allow('', null),
  user_id: Joi.number().integer().optional(),
  End_date: Joi.date().optional().allow(null, ''),
  Event_id: Joi.number().integer().optional().allow(null),
  User_availabil: Joi.string().valid('Book', 'leave').optional(),
  Status: Joi.boolean().optional()
});

const updateAvailabilityCalenderSchema = Joi.object({
  Availability_Calender_id: Joi.number().integer().required().messages({
    'any.required': 'Availability Calender ID is required',
    'number.base': 'Availability Calender ID must be a number'
  }),
  Year: Joi.number().integer().optional(),
  Month: Joi.number().integer().min(1).max(12).optional(),
  Date_start: Joi.date().optional(),
  Start_time: Joi.string().trim().optional().allow('', null),
  End_time: Joi.string().trim().optional().allow('', null),
  user_id: Joi.number().integer().optional(),
  End_date: Joi.date().optional().allow(null, ''),
  Event_id: Joi.number().integer().optional().allow(null),
  User_availabil: Joi.string().valid('Book', 'leave').optional(),
  Status: Joi.boolean().optional()
});

const getAvailabilityCalenderByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'any.required': 'ID is required',
    'number.base': 'ID must be a number'
  })
});

const queryAvailabilityCalenderSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  user_id: Joi.number().integer().optional(),
  Year: Joi.number().integer().optional(),
  Month: Joi.number().integer().optional(),
  Date_start: Joi.date().optional(),
  End_date: Joi.date().optional(),
  Start_time: Joi.string().trim().optional(),
  End_time: Joi.string().trim().optional(),
  Event_id: Joi.number().integer().optional(),
  User_availabil: Joi.string().valid('Book', 'leave').optional(),
  Status: Joi.boolean().optional()
});

module.exports = {
  createAvailabilityCalenderSchema,
  updateAvailabilityCalenderSchema,
  getAvailabilityCalenderByIdSchema,
  queryAvailabilityCalenderSchema
};

