const Joi = require('joi');

const commonValidations = {
  dress_code_name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Dress Code name is required',
      'string.min': 'Dress Code name must be at least 2 characters long',
      'string.max': 'Dress Code name cannot exceed 200 characters'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

const createDressCodeSchema = Joi.object({
  dress_code_name: commonValidations.dress_code_name,
  status: commonValidations.status
});

const updateDressCodeSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Dress Code ID must be a number',
      'number.integer': 'Dress Code ID must be an integer',
      'number.positive': 'Dress Code ID must be a positive number',
      'any.required': 'Dress Code ID is required'
    }),
  dress_code_name: commonValidations.dress_code_name.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field besides id must be provided for update'
});

const getDressCodeByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Dress Code ID must be a number',
      'number.integer': 'Dress Code ID must be an integer',
      'number.positive': 'Dress Code ID must be a positive number'
    })
});

const getAllDressCodeSchema = Joi.object({
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
    .valid('dress_code_name', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: dress_code_name, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createDressCodeSchema,
  updateDressCodeSchema,
  getDressCodeByIdSchema,
  getAllDressCodeSchema
};

