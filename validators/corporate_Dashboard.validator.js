const Joi = require('joi');

// Get corporate dashboard clients validation schema
const getCorporateDashboardClientsSchema = Joi.object({
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
  industry: Joi.string()
    .optional()
    .allow('')
    .trim()
    .max(100)
    .messages({
      'string.max': 'Industry filter cannot exceed 100 characters'
    }),
  Plan_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Plan ID must be a number',
      'number.integer': 'Plan ID must be an integer',
      'number.positive': 'Plan ID must be a positive number'
    }),
  Status: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'Status must be either true or false'
    })
});

module.exports = {
  getCorporateDashboardClientsSchema
};
