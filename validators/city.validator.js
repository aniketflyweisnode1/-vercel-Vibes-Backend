const Joi = require('joi');

/**
 * City validation schemas using Joi
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

  state_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'State ID must be a number',
      'number.integer': 'State ID must be an integer',
      'number.positive': 'State ID must be a positive number'
    }),

  country_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Country ID must be a number',
      'number.integer': 'Country ID must be an integer',
      'number.positive': 'Country ID must be a positive number'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create city validation schema
const createCitySchema = Joi.object({
  name: commonValidations.name,
  state_id: commonValidations.state_id,
  country_id: commonValidations.country_id,
  status: commonValidations.status
});

// Update city validation schema
const updateCitySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'City ID must be a number',
      'number.integer': 'City ID must be an integer',
      'number.positive': 'City ID must be a positive number',
      'any.required': 'City ID is required'
    }),
  name: commonValidations.name.optional(),
  state_id: commonValidations.state_id.optional(),
  country_id: commonValidations.country_id.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get city by ID validation schema
const getCityByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'City ID must be a number',
      'number.integer': 'City ID must be an integer',
      'number.positive': 'City ID must be a positive number'
    })
});

// Get all cities query validation schema
const getAllCitiesSchema = Joi.object({
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
  country_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Country ID must be a number',
      'number.integer': 'Country ID must be an integer',
      'number.positive': 'Country ID must be a positive number'
    }),
  state_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'State ID must be a number',
      'number.integer': 'State ID must be an integer',
      'number.positive': 'State ID must be a positive number'
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

// Get cities by country ID validation schema
const getCitiesByCountryIdSchema = Joi.object({
  countryId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Country ID must be a number',
      'number.integer': 'Country ID must be an integer',
      'number.positive': 'Country ID must be a positive number'
    })
});

// Get cities by state ID validation schema
const getCitiesByStateIdSchema = Joi.object({
  stateId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'State ID must be a number',
      'number.integer': 'State ID must be an integer',
      'number.positive': 'State ID must be a positive number'
    })
});

module.exports = {
  createCitySchema,
  updateCitySchema,
  getCityByIdSchema,
  getAllCitiesSchema,
  getCitiesByCountryIdSchema,
  getCitiesByStateIdSchema
};
