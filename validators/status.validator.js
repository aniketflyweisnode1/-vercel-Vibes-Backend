const Joi = require('joi');

/**
 * Status validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),

  color: Joi.string()
    .trim()
    .max(20)
    .optional()
    .messages({
      'string.max': 'Color cannot exceed 20 characters'
    }),

  emoji: Joi.string()
    .trim()
    .max(10)
    .optional()
    .messages({
      'string.max': 'Emoji cannot exceed 10 characters'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create status validation schema
const createStatusSchema = Joi.object({
  name: commonValidations.name,
  color: commonValidations.color,
  emoji: commonValidations.emoji,
  status: commonValidations.status
});

// Update status validation schema
const updateStatusSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Status ID must be a number',
      'number.integer': 'Status ID must be an integer',
      'number.positive': 'Status ID must be a positive number'
    }),
  name: commonValidations.name.optional(),
  color: commonValidations.color.optional(),
  emoji: commonValidations.emoji.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get status by ID validation schema
const getStatusByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Status ID must be a number',
      'number.integer': 'Status ID must be an integer',
      'number.positive': 'Status ID must be a positive number'
    })
});

// Get all statuses query validation schema
const getAllStatusesSchema = Joi.object({
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
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  sortBy: Joi.string()
    .valid('name', 'color', 'emoji', 'status', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: name, color, emoji, status, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Update all statuses validation schema
const updateAllStatusesSchema = Joi.object({
  statuses: Joi.array()
    .items(
      Joi.object({
        id: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            'number.base': 'Status ID must be a number',
            'number.integer': 'Status ID must be an integer',
            'number.positive': 'Status ID must be a positive number',
            'any.required': 'Status ID is required'
          }),
        name: commonValidations.name.optional(),
        color: commonValidations.color.optional(),
        emoji: commonValidations.emoji.optional(),
        status: commonValidations.status.optional()
      }).min(2).messages({
        'object.min': 'At least one field (other than ID) must be provided for update'
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one status must be provided',
      'any.required': 'Statuses array is required'
    })
});

module.exports = {
  createStatusSchema,
  updateStatusSchema,
  getStatusByIdSchema,
  getAllStatusesSchema,
  updateAllStatusesSchema
};
