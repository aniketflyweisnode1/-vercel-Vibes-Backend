const Joi = require('joi');

const commonValidations = {
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

  share_user_to: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Share user to must be a number',
      'number.integer': 'Share user to must be an integer',
      'number.positive': 'Share user to must be a positive number',
      'any.required': 'Share user to is required'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

const createShareEventSchema = Joi.object({
  event_id: commonValidations.event_id,
  share_user_to: commonValidations.share_user_to,
  status: commonValidations.status
});

const updateShareEventSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Share Event ID must be a number',
      'number.integer': 'Share Event ID must be an integer',
      'number.positive': 'Share Event ID must be a positive number',
      'any.required': 'Share Event ID is required'
    }),
  event_id: commonValidations.event_id.optional(),
  share_user_to: commonValidations.share_user_to.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field besides id must be provided for update'
});

const getShareEventByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Share Event ID must be a number',
      'number.integer': 'Share Event ID must be an integer',
      'number.positive': 'Share Event ID must be a positive number'
    })
});

const getAllShareEventSchema = Joi.object({
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
  event_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Event ID must be a number',
      'number.integer': 'Event ID must be an integer',
      'number.positive': 'Event ID must be a positive number'
    }),
  share_user_to: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Share user to must be a number',
      'number.integer': 'Share user to must be an integer',
      'number.positive': 'Share user to must be a positive number'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  sortBy: Joi.string()
    .valid('event_id', 'share_user_to', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: event_id, share_user_to, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createShareEventSchema,
  updateShareEventSchema,
  getShareEventByIdSchema,
  getAllShareEventSchema
};

