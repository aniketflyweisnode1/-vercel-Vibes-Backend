const Joi = require('joi');

// Create corporate dashboard pricing plans validation schema
const createCorporateDashboardPricingPlansSchema = Joi.object({
  MinBookingFee: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Minimum booking fee must be a number',
      'number.min': 'Minimum booking fee cannot be negative',
      'any.required': 'Minimum booking fee is required'
    }),
  PriceRangeMin: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Price range minimum must be a number',
      'number.min': 'Price range minimum cannot be negative',
      'any.required': 'Price range minimum is required'
    }),
  PriceRangeMax: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Price range maximum must be a number',
      'number.min': 'Price range maximum cannot be negative',
      'any.required': 'Price range maximum is required'
    }),
  isDeposit: Joi.boolean()
    .optional()
    .default(false),
  PaymentMethods: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required()
    .messages({
      'array.base': 'Payment methods must be an array',
      'array.min': 'At least one payment method is required',
      'any.required': 'Payment methods are required'
    }),
  Status: Joi.boolean()
    .optional()
    .default(true)
}).custom((value, helpers) => {
  // Custom validation to ensure PriceRangeMax is greater than PriceRangeMin
  if (value.PriceRangeMax <= value.PriceRangeMin) {
    return helpers.error('custom.priceRange');
  }
  return value;
}).messages({
  'custom.priceRange': 'Price range maximum must be greater than price range minimum'
});

// Update corporate dashboard pricing plans validation schema
const updateCorporateDashboardPricingPlansSchema = Joi.object({
  PricingPlans_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Pricing Plans ID must be a number',
      'number.integer': 'Pricing Plans ID must be an integer',
      'number.positive': 'Pricing Plans ID must be a positive number',
      'any.required': 'Pricing Plans ID is required'
    }),
  MinBookingFee: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Minimum booking fee must be a number',
      'number.min': 'Minimum booking fee cannot be negative'
    }),
  PriceRangeMin: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Price range minimum must be a number',
      'number.min': 'Price range minimum cannot be negative'
    }),
  PriceRangeMax: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Price range maximum must be a number',
      'number.min': 'Price range maximum cannot be negative'
    }),
  isDeposit: Joi.boolean()
    .optional(),
  PaymentMethods: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .optional()
    .messages({
      'array.base': 'Payment methods must be an array',
      'array.min': 'At least one payment method is required'
    }),
  Status: Joi.boolean()
    .optional()
}).custom((value, helpers) => {
  // Custom validation to ensure PriceRangeMax is greater than PriceRangeMin
  // Only validate if both values are provided
  if (value.PriceRangeMax !== undefined && value.PriceRangeMin !== undefined) {
    if (value.PriceRangeMax <= value.PriceRangeMin) {
      return helpers.error('custom.priceRange');
    }
  }
  return value;
}).messages({
  'custom.priceRange': 'Price range maximum must be greater than price range minimum'
});

// Get corporate dashboard pricing plans by ID validation schema
const getCorporateDashboardPricingPlansByIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': 'ID must be a valid number',
      'any.required': 'ID is required'
    })
});

// Delete corporate dashboard pricing plans validation schema
const deleteCorporateDashboardPricingPlansSchema = Joi.object({
  id: Joi.string()
    .pattern(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': 'ID must be a valid number',
      'any.required': 'ID is required'
    })
});

// Query validation schema for getAll
const querySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
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
    .optional()
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string()
    .optional()
    .allow('')
    .trim()
    .max(100)
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  MinBookingFee: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Minimum booking fee must be a number',
      'number.min': 'Minimum booking fee cannot be negative'
    }),
  PriceRangeMin: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Price range minimum must be a number',
      'number.min': 'Price range minimum cannot be negative'
    }),
  PriceRangeMax: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Price range maximum must be a number',
      'number.min': 'Price range maximum cannot be negative'
    }),
  isDeposit: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'isDeposit must be either true or false'
    }),
  Status: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'Status must be either true or false'
    })
});

module.exports = {
  createCorporateDashboardPricingPlansSchema,
  updateCorporateDashboardPricingPlansSchema,
  getCorporateDashboardPricingPlansByIdSchema,
  deleteCorporateDashboardPricingPlansSchema,
  querySchema
};
