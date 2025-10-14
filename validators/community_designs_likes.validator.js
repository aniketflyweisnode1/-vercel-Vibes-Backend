const Joi = require('joi');

/**
 * Community Designs Likes validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  community_designs_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Community Designs ID must be a number',
      'number.integer': 'Community Designs ID must be an integer',
      'number.positive': 'Community Designs ID must be a positive number',
      'any.required': 'Community Designs ID is required'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create community design like validation schema
const createCommunityDesignLikeSchema = Joi.object({
  community_designs_id: commonValidations.community_designs_id,
  status: commonValidations.status
});

// Update community design like validation schema
const updateCommunityDesignLikeSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Community Designs Likes ID must be a number',
      'number.integer': 'Community Designs Likes ID must be an integer',
      'number.positive': 'Community Designs Likes ID must be a positive number',
      'any.required': 'Community Designs Likes ID is required'
    }),
  community_designs_id: commonValidations.community_designs_id.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field (besides id) must be provided for update'
});

// Get community design like by ID validation schema
const getCommunityDesignLikeByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Community Designs Likes ID must be a number',
      'number.integer': 'Community Designs Likes ID must be an integer',
      'number.positive': 'Community Designs Likes ID must be a positive number'
    })
});

// Get all community design likes query validation schema
const getAllCommunityDesignLikesSchema = Joi.object({
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
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  community_designs_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow('')
    .messages({
      'number.base': 'Community Designs ID must be a number',
      'number.integer': 'Community Designs ID must be an integer',
      'number.positive': 'Community Designs ID must be a positive number'
    }),
  sortBy: Joi.string()
    .valid('community_designs_id', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: community_designs_id, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createCommunityDesignLikeSchema,
  updateCommunityDesignLikeSchema,
  getCommunityDesignLikeByIdSchema,
  getAllCommunityDesignLikesSchema
};

