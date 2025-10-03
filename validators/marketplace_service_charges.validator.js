const Joi = require('joi');

const commonValidations = {
  user_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow('')
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),

  service_name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Service name is required',
      'string.min': 'Service name must be at least 2 characters long',
      'string.max': 'Service name cannot exceed 200 characters'
    }),

  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price must be a positive number',
      'any.required': 'Price is required'
    }),

  rateing: Joi.number()
    .min(0)
    .max(5)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 0',
      'number.max': 'Rating cannot exceed 5'
    }),

  emozi: Joi.string()
    .trim()
    .max(10)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Emoji cannot exceed 10 characters'
    }),

  location: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Location cannot exceed 500 characters'
    }),

  category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null, '')
    .messages({
      'number.base': 'Category ID must be a number',
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be a positive number'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

const createMarketPlaceServiceChargesSchema = Joi.object({
  user_id: commonValidations.user_id,
  service_name: commonValidations.service_name,
  price: commonValidations.price,
  rateing: commonValidations.rateing,
  emozi: commonValidations.emozi,
  location: commonValidations.location,
  category_id: commonValidations.category_id,
  status: commonValidations.status
});

const updateMarketPlaceServiceChargesSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Service Charges ID must be a number',
      'number.integer': 'Service Charges ID must be an integer',
      'number.positive': 'Service Charges ID must be a positive number',
      'any.required': 'Service Charges ID is required'
    }),
  user_id: commonValidations.user_id.optional(),
  service_name: commonValidations.service_name.optional(),
  price: commonValidations.price.optional(),
  rateing: commonValidations.rateing,
  emozi: commonValidations.emozi,
  location: commonValidations.location,
  category_id: commonValidations.category_id,
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field besides id must be provided for update'
});

const getMarketPlaceServiceChargesByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Service Charges ID must be a number',
      'number.integer': 'Service Charges ID must be an integer',
      'number.positive': 'Service Charges ID must be a positive number'
    })
});

const getAllMarketPlaceServiceChargesSchema = Joi.object({
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
  user_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),
  category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Category ID must be a number',
      'number.integer': 'Category ID must be an integer',
      'number.positive': 'Category ID must be a positive number'
    }),
  location: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Location search term cannot exceed 100 characters'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  sortBy: Joi.string()
    .valid('service_name', 'price', 'rateing', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: service_name, price, rateing, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createMarketPlaceServiceChargesSchema,
  updateMarketPlaceServiceChargesSchema,
  getMarketPlaceServiceChargesByIdSchema,
  getAllMarketPlaceServiceChargesSchema
};

