const Joi = require('joi');

/**
 * Event Amenities validation schemas using Joi
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

  image: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Image URL cannot exceed 500 characters'
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

// Create event amenity validation schema
const createEventAmenitySchema = Joi.object({
  name: commonValidations.name,
  image: commonValidations.image,
  emoji: commonValidations.emoji,
  status: commonValidations.status
});

// Update event amenity validation schema
const updateEventAmenitySchema = Joi.object({ 
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Event Amenity ID must be a number',
      'number.integer': 'Event Amenity ID must be an integer',
      'number.positive': 'Event Amenity ID must be a positive number'
    }),
  name: commonValidations.name.optional(),
  image: commonValidations.image.optional(),
  emoji: commonValidations.emoji.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get event amenity by ID validation schema
const getEventAmenityByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Event Amenity ID must be a number',
      'number.integer': 'Event Amenity ID must be an integer',
      'number.positive': 'Event Amenity ID must be a positive number'
    })
});

// Get all event amenities query validation schema
const getAllEventAmenitiesSchema = Joi.object({
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
    .valid('name', 'emoji', 'status', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: name, emoji, status, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createEventAmenitySchema,
  updateEventAmenitySchema,
  getEventAmenityByIdSchema,
  getAllEventAmenitiesSchema
};
