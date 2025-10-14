const Joi = require('joi');

/**
 * Community Designs Downloads validation schemas using Joi
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

// Create community design download validation schema
const createCommunityDesignDownloadSchema = Joi.object({
  community_designs_id: commonValidations.community_designs_id,
  status: commonValidations.status
});

// Update community design download validation schema
const updateCommunityDesignDownloadSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Community Designs Downloads ID must be a number',
      'number.integer': 'Community Designs Downloads ID must be an integer',
      'number.positive': 'Community Designs Downloads ID must be a positive number',
      'any.required': 'Community Designs Downloads ID is required'
    }),
  community_designs_id: commonValidations.community_designs_id.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field (besides id) must be provided for update'
});

// Get community design download by ID validation schema
const getCommunityDesignDownloadByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Community Designs Downloads ID must be a number',
      'number.integer': 'Community Designs Downloads ID must be an integer',
      'number.positive': 'Community Designs Downloads ID must be a positive number'
    })
});

// Get all community design downloads query validation schema
const getAllCommunityDesignDownloadsSchema = Joi.object({
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
  createCommunityDesignDownloadSchema,
  updateCommunityDesignDownloadSchema,
  getCommunityDesignDownloadByIdSchema,
  getAllCommunityDesignDownloadsSchema
};

