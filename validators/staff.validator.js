const Joi = require('joi');

// Create staff schema
const createStaffSchema = Joi.object({

  staff_category_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Staff Category ID must be a number',
    'number.integer': 'Staff Category ID must be an integer',
    'number.positive': 'Staff Category ID must be a positive number',
    'any.required': 'Staff Category ID is required'
  }),
  price: Joi.number().min(0).required().messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price cannot be negative',
    'any.required': 'Price is required'
  }),
  review_count: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Review count must be a number',
    'number.integer': 'Review count must be an integer',
    'number.min': 'Review count cannot be negative'
  }),
  
});

// Update staff schema
const updateStaffSchema = Joi.object({
  staff_working_price_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Staff Working Price ID must be a number',
    'number.integer': 'Staff Working Price ID must be an integer',
    'number.positive': 'Staff Working Price ID must be a positive number',
    'any.required': 'Staff Working Price ID is required'
  }),
  staff_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Staff ID must be a number',
    'number.integer': 'Staff ID must be an integer',
    'number.positive': 'Staff ID must be a positive number'
  }),
  staff_category_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Staff Category ID must be a number',
    'number.integer': 'Staff Category ID must be an integer',
    'number.positive': 'Staff Category ID must be a positive number'
  }),
  price: Joi.number().min(0).optional().messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price cannot be negative'
  }),
  review_count: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Review count must be a number',
    'number.integer': 'Review count must be an integer',
    'number.min': 'Review count cannot be negative'
  }),
  status: Joi.boolean().optional().messages({
    'boolean.base': 'Status must be a boolean'
  })
});

// Get staff by ID schema
const getStaffByIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.positive': 'ID must be a positive number',
    'any.required': 'ID is required'
  })
});

// Get staff by category ID schema
const getStaffByCategoryIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'Category ID must be a number',
    'number.integer': 'Category ID must be an integer',
    'number.positive': 'Category ID must be a positive number',
    'any.required': 'Category ID is required'
  })
});

// Delete staff schema
const deleteStaffSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.positive': 'ID must be a positive number',
    'any.required': 'ID is required'
  })
});

module.exports = {
  createStaffSchema,
  updateStaffSchema,
  getStaffByIdSchema,
  getStaffByCategoryIdSchema,
  deleteStaffSchema
};
