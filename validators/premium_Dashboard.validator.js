const Joi = require('joi');

// Get premium dashboard events validation schema
const getPremiumDashboardEventsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
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
    .optional()
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string()
    .optional()
    .allow('')
    .trim()
    .max(100)
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  event_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Event type ID must be a number',
      'number.integer': 'Event type ID must be an integer',
      'number.positive': 'Event type ID must be a positive number'
    }),
  date_from: Joi.date()
    .optional()
    .messages({
      'date.base': 'Date from must be a valid date'
    }),
  date_to: Joi.date()
    .optional()
    .messages({
      'date.base': 'Date to must be a valid date'
    }),
  status: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'Status must be either true or false'
    })
}).custom((value, helpers) => {
  // Custom validation to ensure date_to is after date_from
  if (value.date_from && value.date_to) {
    if (new Date(value.date_to) <= new Date(value.date_from)) {
      return helpers.error('custom.dateRange');
    }
  }
  return value;
}).messages({
  'custom.dateRange': 'Date to must be after date from'
});

module.exports = {
  getPremiumDashboardEventsSchema
};
