const Joi = require('joi');

const photoSchema = Joi.object({
  name: Joi.string()
    .trim()
    .max(200)
    .allow('')
    .messages({
      'string.max': 'Photo name cannot exceed 200 characters'
    }),
  photo: Joi.string()
    .trim()
    .allow('')
    .messages({
      'string.base': 'Photo must be a string'
    })
});

const commonValidations = {
  event_gallery_name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Event Gallery name is required',
      'string.min': 'Event Gallery name must be at least 2 characters long',
      'string.max': 'Event Gallery name cannot exceed 200 characters'
    }),

  event_gallery_photo: Joi.array()
    .items(photoSchema)
    .optional()
    .default([])
    .messages({
      'array.base': 'Event Gallery photo must be an array'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

const createEventGallerySchema = Joi.object({
  event_gallery_name: commonValidations.event_gallery_name,
  event_gallery_photo: commonValidations.event_gallery_photo,
  status: commonValidations.status
});

const updateEventGallerySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Event Gallery ID must be a number',
      'number.integer': 'Event Gallery ID must be an integer',
      'number.positive': 'Event Gallery ID must be a positive number',
      'any.required': 'Event Gallery ID is required'
    }),
  event_gallery_name: commonValidations.event_gallery_name.optional(),
  event_gallery_photo: commonValidations.event_gallery_photo,
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field besides id must be provided for update'
});

const getEventGalleryByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Event Gallery ID must be a number',
      'number.integer': 'Event Gallery ID must be an integer',
      'number.positive': 'Event Gallery ID must be a positive number'
    })
});

const getAllEventGallerySchema = Joi.object({
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
    .valid('event_gallery_name', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: event_gallery_name, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createEventGallerySchema,
  updateEventGallerySchema,
  getEventGalleryByIdSchema,
  getAllEventGallerySchema
};

