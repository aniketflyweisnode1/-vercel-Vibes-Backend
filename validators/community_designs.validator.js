const Joi = require('joi');

/**
 * Community Designs validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  categories_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Category ID must be a number',
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be a positive number',
      'any.required': 'Category ID is required'
    }),

  image: Joi.string()
    .trim()
    .optional()
    .allow(null, '')
    .messages({
      'string.base': 'Image must be a string'
    }),

  title: Joi.string()
    .trim()
    .max(300)
    .required()
    .messages({
      'string.base': 'Title must be a string',
      'string.max': 'Title cannot exceed 300 characters',
      'any.required': 'Title is required'
    }),

  sub_title: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow(null, '')
    .messages({
      'string.base': 'SubTitle must be a string',
      'string.max': 'SubTitle cannot exceed 500 characters'
    }),

  image_type: Joi.string()
    .valid('Intermediate', 'Beginner', 'Advanced')
    .required()
    .messages({
      'any.only': 'Image type must be one of: Intermediate, Beginner, Advanced',
      'any.required': 'Image type is required'
    }),

  image_sell_type: Joi.string()
    .valid('free', 'premium')
    .required()
    .messages({
      'any.only': 'Image sell type must be either free or premium',
      'any.required': 'Image sell type is required'
    }),

  hash_tag: Joi.array()
    .items(Joi.string().trim())
    .optional()
    .default([])
    .messages({
      'array.base': 'Hash tag must be an array of strings'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create community design validation schema
const createCommunityDesignSchema = Joi.object({
  categories_id: commonValidations.categories_id,
  image: commonValidations.image,
  title: commonValidations.title,
  sub_title: commonValidations.sub_title,
  image_type: commonValidations.image_type,
  image_sell_type: commonValidations.image_sell_type,
  hash_tag: commonValidations.hash_tag,
  status: commonValidations.status
});

// Update community design validation schema
const updateCommunityDesignSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Community Designs ID must be a number',
      'number.integer': 'Community Designs ID must be an integer',
      'number.positive': 'Community Designs ID must be a positive number',
      'any.required': 'Community Designs ID is required'
    }),
  categories_id: commonValidations.categories_id.optional(),
  image: commonValidations.image.optional(),
  title: commonValidations.title.optional(),
  sub_title: commonValidations.sub_title.optional(),
  image_type: commonValidations.image_type.optional(),
  image_sell_type: commonValidations.image_sell_type.optional(),
  hash_tag: commonValidations.hash_tag.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field (besides id) must be provided for update'
});

// Get community design by ID validation schema
const getCommunityDesignByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Community Designs ID must be a number',
      'number.integer': 'Community Designs ID must be an integer',
      'number.positive': 'Community Designs ID must be a positive number'
    })
});

// Get all community designs query validation schema
const getAllCommunityDesignsSchema = Joi.object({
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
  categories_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow('')
    .messages({
      'number.base': 'Category ID must be a number',
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be a positive number'
    }),
  image_type: Joi.string()
    .valid('Intermediate', 'Beginner', 'Advanced')
    .optional()
    .allow('')
    .messages({
      'any.only': 'Image type must be one of: Intermediate, Beginner, Advanced'
    }),
  image_sell_type: Joi.string()
    .valid('free', 'premium')
    .optional()
    .allow('')
    .messages({
      'any.only': 'Image sell type must be either free or premium'
    }),
  sortBy: Joi.string()
    .valid('title', 'categories_id', 'likes', 'views', 'share', 'remixes', 'downloads', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: title, categories_id, likes, views, share, remixes, downloads, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createCommunityDesignSchema,
  updateCommunityDesignSchema,
  getCommunityDesignByIdSchema,
  getAllCommunityDesignsSchema
};

