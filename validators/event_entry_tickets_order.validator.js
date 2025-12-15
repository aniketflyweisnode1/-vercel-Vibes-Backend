const Joi = require('joi');

// Validation schema for creating event entry tickets order
const createEventEntryTicketsOrderSchema = Joi.object({
  event_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0',
    'any.required': 'Event ID is required'
  }),
  tax_percentage: Joi.number().min(0).max(100).default(0).messages({
    'number.base': 'Tax percentage must be a number',
    'number.min': 'Tax percentage must be 0 or greater',
    'number.max': 'Tax percentage cannot exceed 100'
  }),
  coupon_code: Joi.string().trim().uppercase().max(50).allow('', null).messages({
    'string.max': 'Coupon code cannot exceed 50 characters'
  })
});

// Validation schema for updating event entry tickets order
const updateEventEntryTicketsOrderSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  }),
  event_entry_userget_tickets_id: Joi.number().integer().min(1).messages({
    'number.base': 'Event entry userget tickets ID must be a number',
    'number.integer': 'Event entry userget tickets ID must be an integer',
    'number.min': 'Event entry userget tickets ID must be greater than 0'
  }),
  event_id: Joi.number().integer().min(1).messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0'
  }),
  quantity: Joi.number().integer().min(1).messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be an integer',
    'number.min': 'Quantity must be at least 1'
  }),
  price: Joi.number().min(0).messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price must be 0 or greater'
  }),
  subtotal: Joi.number().min(0).messages({
    'number.base': 'Subtotal must be a number',
    'number.min': 'Subtotal must be 0 or greater'
  }),
  tax: Joi.number().min(0).messages({
    'number.base': 'Tax must be a number',
    'number.min': 'Tax must be 0 or greater'
  }),
  total: Joi.number().min(0).messages({
    'number.base': 'Total must be a number',
    'number.min': 'Total must be 0 or greater'
  }),
  status: Joi.boolean()
}).min(2).messages({
  'object.min': 'At least one field must be provided for update (excluding ID)'
});

// Validation schema for query parameters
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('true', 'false').allow(''),
  event_id: Joi.number().integer().min(1).allow('').messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0'
  }),
  event_entry_userget_tickets_id: Joi.number().integer().min(1).allow('').messages({
    'number.base': 'Event entry userget tickets ID must be a number',
    'number.integer': 'Event entry userget tickets ID must be an integer',
    'number.min': 'Event entry userget tickets ID must be greater than 0'
  })
});

// Validation schema for ID parameter
const idSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  })
});

// Validation schema for payment processing
const processPaymentSchema = Joi.object({
  order_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Order ID must be a number',
    'number.integer': 'Order ID must be an integer',
    'number.min': 'Order ID must be greater than 0',
    'any.required': 'Order ID is required'
  }),
  payment_method_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Payment method ID must be a number',
    'number.integer': 'Payment method ID must be an integer',
    'number.min': 'Payment method ID must be greater than 0',
    'any.required': 'Payment method ID is required'
  })
});

// Validation schema for checking payment status
const checkPaymentStatusSchema = Joi.object({
  payment_intent_id: Joi.string().required().messages({
    'string.base': 'Payment intent ID must be a string',
    'any.required': 'Payment intent ID is required'
  })
});

module.exports = {
  createEventEntryTicketsOrderSchema,
  updateEventEntryTicketsOrderSchema,
  querySchema,
  idSchema,
  processPaymentSchema,
  checkPaymentStatusSchema
};

