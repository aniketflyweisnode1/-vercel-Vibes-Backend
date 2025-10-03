const Joi = require('joi');

/**
 * Design Community validation schemas using Joi
 */

// Common validation patterns
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

  invited_user_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Invited User ID must be a number',
      'number.integer': 'Invited User ID must be an integer',
      'number.positive': 'Invited User ID must be a positive number',
      'any.required': 'Invited User ID is required'
    }),

  approval: Joi.string()
    .valid('Accept', 'Decline')
    .optional()
    .allow(null)
    .messages({
      'any.only': 'Approval must be either Accept or Decline'
    }),

  emoji: Joi.string()
    .trim()
    .max(10)
    .optional()
    .allow(null)
    .messages({
      'string.max': 'Emoji cannot exceed 10 characters'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create design community validation schema
const createDesignCommunitySchema = Joi.object({
  event_id: commonValidations.event_id,
  invited_user_id: commonValidations.invited_user_id,
  approval: commonValidations.approval,
  emoji: commonValidations.emoji,
  status: commonValidations.status
});

// Update design community validation schema
const updateDesignCommunitySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Design Community ID must be a number',
      'number.integer': 'Design Community ID must be an integer',
      'number.positive': 'Design Community ID must be a positive number',
      'any.required': 'Design Community ID is required'
    }),
  event_id: commonValidations.event_id.optional(),
  invited_user_id: commonValidations.invited_user_id.optional(),
  approval: commonValidations.approval.optional(),
  emoji: commonValidations.emoji.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get design community by ID validation schema
const getDesignCommunityByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Design Community ID must be a number',
      'number.integer': 'Design Community ID must be an integer',
      'number.positive': 'Design Community ID must be a positive number'
    })
});

// Get all design communities query validation schema
const getAllDesignCommunitiesSchema = Joi.object({
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
  event_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow('')
    .messages({
      'number.base': 'Event ID must be a number',
      'number.integer': 'Event ID must be an integer',
      'number.positive': 'Event ID must be a positive number'
    }),
  invited_user_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow('')
    .messages({
      'number.base': 'Invited User ID must be a number',
      'number.integer': 'Invited User ID must be an integer',
      'number.positive': 'Invited User ID must be a positive number'
    }),
  approval: Joi.string()
    .valid('Accept', 'Decline')
    .optional()
    .allow('')
    .messages({
      'any.only': 'Approval must be either Accept or Decline'
    }),
  sortBy: Joi.string()
    .valid('event_id', 'invited_user_id', 'approval', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: event_id, invited_user_id, approval, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createDesignCommunitySchema,
  updateDesignCommunitySchema,
  getDesignCommunityByIdSchema,
  getAllDesignCommunitiesSchema
};
