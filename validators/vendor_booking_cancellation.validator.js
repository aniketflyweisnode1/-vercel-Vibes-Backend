const Joi = require('joi');

// Cancel vendor booking schema
const cancelVendorBookingSchema = Joi.object({
  vendor_booking_id: Joi.number().integer().required().messages({
    'any.required': 'Vendor booking ID is required',
    'number.base': 'Vendor booking ID must be a number'
  }),
  cancellation_reason: Joi.string().optional().allow('', null),
  process_refund: Joi.boolean().optional().default(true)
});

// Get refund calculation schema (params)
const getRefundCalculationParamsSchema = Joi.object({
  vendor_booking_id: Joi.number().integer().required().messages({
    'any.required': 'Vendor booking ID is required',
    'number.base': 'Vendor booking ID must be a number'
  })
});

// Process refund schema
const processRefundSchema = Joi.object({
  vendor_booking_id: Joi.number().integer().required().messages({
    'any.required': 'Vendor booking ID is required',
    'number.base': 'Vendor booking ID must be a number'
  }),
  refund_amount: Joi.number().min(0).optional().messages({
    'number.base': 'Refund amount must be a number',
    'number.min': 'Refund amount cannot be negative'
  })
});

// Reschedule vendor booking schema
const rescheduleVendorBookingSchema = Joi.object({
  vendor_booking_id: Joi.number().integer().required().messages({
    'any.required': 'Vendor booking ID is required',
    'number.base': 'Vendor booking ID must be a number'
  }),
  Date_start: Joi.date().optional().messages({
    'date.base': 'Start date must be a valid date'
  }),
  End_date: Joi.date().optional().allow(null).messages({
    'date.base': 'End date must be a valid date'
  }),
  Start_time: Joi.string().optional().allow('', null),
  End_time: Joi.string().optional().allow('', null),
  Year: Joi.number().integer().min(2000).max(2100).optional().messages({
    'number.base': 'Year must be a number',
    'number.min': 'Year must be between 2000 and 2100',
    'number.max': 'Year must be between 2000 and 2100'
  }),
  Month: Joi.number().integer().min(1).max(12).optional().messages({
    'number.base': 'Month must be a number',
    'number.min': 'Month must be between 1 and 12',
    'number.max': 'Month must be between 1 and 12'
  }),
  reschedule_reason: Joi.string().optional().allow('', null)
});

module.exports = {
  cancelVendorBookingSchema,
  getRefundCalculationParamsSchema,
  processRefundSchema,
  rescheduleVendorBookingSchema
};

