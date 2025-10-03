const Joi = require('joi');

// Create coupon code validation schema
const createCouponCodeSchema = Joi.object({
  code: Joi.string()
    .trim()
    .max(50)
    .required()
    .messages({
      'string.base': 'Code must be a string',
      'string.empty': 'Code cannot be empty',
      'string.max': 'Code cannot exceed 50 characters',
      'any.required': 'Code is required'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .required()
    .messages({
      'string.base': 'Description must be a string',
      'string.empty': 'Description cannot be empty',
      'string.max': 'Description cannot exceed 500 characters',
      'any.required': 'Description is required'
    }),
  name: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name cannot be empty',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  min_order_amount: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Minimum order amount must be a number',
      'number.min': 'Minimum order amount cannot be negative',
      'any.required': 'Minimum order amount is required'
    }),
  max_discount_amount: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Maximum discount amount must be a number',
      'number.min': 'Maximum discount amount cannot be negative',
      'any.required': 'Maximum discount amount is required'
    }),
  usage_limit: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Usage limit must be a number',
      'number.integer': 'Usage limit must be an integer',
      'number.min': 'Usage limit must be at least 1',
      'any.required': 'Usage limit is required'
    }),
  used_count: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Used count must be a number',
      'number.integer': 'Used count must be an integer',
      'number.min': 'Used count cannot be negative'
    }),
  valid_from: Joi.date()
    .required()
    .messages({
      'date.base': 'Valid from must be a valid date',
      'any.required': 'Valid from date is required'
    }),
  valid_until: Joi.date()
    .required()
    .messages({
      'date.base': 'Valid until must be a valid date',
      'any.required': 'Valid until date is required'
    }),
  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Update coupon code validation schema
const updateCouponCodeSchema = Joi.object({
  coupon_code_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Coupon code ID must be a number',
      'number.integer': 'Coupon code ID must be an integer',
      'number.positive': 'Coupon code ID must be a positive number',
      'any.required': 'Coupon code ID is required'
    }),
  code: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.base': 'Code must be a string',
      'string.empty': 'Code cannot be empty',
      'string.max': 'Code cannot exceed 50 characters'
    }),
  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.base': 'Description must be a string',
      'string.empty': 'Description cannot be empty',
      'string.max': 'Description cannot exceed 500 characters'
    }),
  name: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name cannot be empty',
      'string.max': 'Name cannot exceed 100 characters'
    }),
  price: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative'
    }),
  min_order_amount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Minimum order amount must be a number',
      'number.min': 'Minimum order amount cannot be negative'
    }),
  max_discount_amount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Maximum discount amount must be a number',
      'number.min': 'Maximum discount amount cannot be negative'
    }),
  usage_limit: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'Usage limit must be a number',
      'number.integer': 'Usage limit must be an integer',
      'number.min': 'Usage limit must be at least 1'
    }),
  used_count: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Used count must be a number',
      'number.integer': 'Used count must be an integer',
      'number.min': 'Used count cannot be negative'
    }),
  valid_from: Joi.date()
    .optional()
    .messages({
      'date.base': 'Valid from must be a valid date'
    }),
  valid_until: Joi.date()
    .optional()
    .messages({
      'date.base': 'Valid until must be a valid date'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
});

// Get coupon code by ID validation schema
const getCouponCodeByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer',
      'number.positive': 'ID must be a positive number',
      'any.required': 'ID is required'
    })
});

// Get all coupon codes query validation schema
const getAllCouponCodesSchema = Joi.object({
  page: Joi.number().integer().min(1).optional()
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number().integer().min(1).max(100).optional()
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string().max(100).allow('').optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  status: Joi.string().valid('true', 'false').optional()
    .messages({
      'any.only': 'Status must be either "true" or "false"'
    }),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'name', 'price', 'coupon_code_id').optional()
    .messages({
      'any.only': 'Sort by must be one of: created_at, updated_at, name, price, coupon_code_id'
    }),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
    .messages({
      'any.only': 'Sort order must be either "asc" or "desc"'
    })
});

module.exports = {
  createCouponCodeSchema,
  updateCouponCodeSchema,
  getCouponCodeByIdSchema,
  getAllCouponCodesSchema
};
