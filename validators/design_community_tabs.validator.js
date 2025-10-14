const Joi = require('joi');

/**
 * Design Community Tabs validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  name: Joi.string()
    .trim()
    .max(200)
    .required()
    .messages({
      'string.base': 'Name must be a string',
      'string.max': 'Name cannot exceed 200 characters',
      'any.required': 'Name is required'
    }),

  emoji: Joi.string()
    .trim()
    .max(10)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Emoji cannot exceed 10 characters'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create design community tab validation schema
const createDesignCommunityTabSchema = Joi.object({
  name: commonValidations.name,
  emoji: commonValidations.emoji,
  status: commonValidations.status
});

// Update design community tab validation schema
const updateDesignCommunityTabSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Tabs ID must be a number',
      'number.integer': 'Tabs ID must be an integer',
      'number.positive': 'Tabs ID must be a positive number',
      'any.required': 'Tabs ID is required'
    }),
  name: commonValidations.name.optional(),
  emoji: commonValidations.emoji.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field (besides id) must be provided for update'
});

// Get design community tab by ID validation schema
const getDesignCommunityTabByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Tabs ID must be a number',
      'number.integer': 'Tabs ID must be an integer',
      'number.positive': 'Tabs ID must be a positive number'
    })
});

// Get all design community tabs query validation schema
const getAllDesignCommunityTabsSchema = Joi.object({
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
    .valid('name', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: name, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createDesignCommunityTabSchema,
  updateDesignCommunityTabSchema,
  getDesignCommunityTabByIdSchema,
  getAllDesignCommunityTabsSchema
};

