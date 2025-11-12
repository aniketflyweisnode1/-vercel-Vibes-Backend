const Joi = require('joi');

const createVendorBookingSchema = Joi.object({
  Year: Joi.number().integer().optional(),
  Month: Joi.number().integer().min(1).max(12).optional(),
  Date_start: Joi.date().required().messages({
    'any.required': 'Date_start is required',
    'date.base': 'Date_start must be a valid date'
  }),
  End_date: Joi.date().optional().allow(null, ''),
  User_availabil: Joi.string().valid('Book', 'leave').optional(),
  Start_time: Joi.string().trim().optional().allow('', null),
  End_time: Joi.string().trim().optional().allow('', null),
  user_id: Joi.number().integer().optional(),
  vendor_id: Joi.number().integer().optional().allow(null),
  Vendor_Category_id: Joi.array().items(Joi.number().integer()).optional(),
  Event_id: Joi.number().integer().optional().allow(null),
  vender_booking_status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'rescheduled').optional(),
  Status: Joi.boolean().optional()
});

const updateVendorBookingSchema = Joi.object({
  Vendor_Booking_id: Joi.number().integer().required().messages({
    'any.required': 'Vendor booking ID is required',
    'number.base': 'Vendor booking ID must be a number'
  }),
  Year: Joi.number().integer().optional(),
  Month: Joi.number().integer().min(1).max(12).optional(),
  Date_start: Joi.date().optional(),
  End_date: Joi.date().optional().allow(null, ''),
  User_availabil: Joi.string().valid('Book', 'leave').optional(),
  Start_time: Joi.string().trim().optional().allow('', null),
  End_time: Joi.string().trim().optional().allow('', null),
  user_id: Joi.number().integer().optional(),
  vendor_id: Joi.number().integer().optional().allow(null),
  Vendor_Category_id: Joi.array().items(Joi.number().integer()).optional(),
  Event_id: Joi.number().integer().optional().allow(null),
  vender_booking_status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'rescheduled').optional(),
  Status: Joi.boolean().optional()
});

const getVendorBookingByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'any.required': 'ID is required',
    'number.base': 'ID must be a number'
  })
});

const queryVendorBookingSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  user_id: Joi.number().integer().optional(),
  vendor_id: Joi.number().integer().optional(),
  Year: Joi.number().integer().optional(),
  Month: Joi.number().integer().optional(),
  Date_start: Joi.date().optional(),
  End_date: Joi.date().optional(),
  Start_time: Joi.string().trim().optional(),
  End_time: Joi.string().trim().optional(),
  Event_id: Joi.number().integer().optional(),
  User_availabil: Joi.string().valid('Book', 'leave').optional(),
  vender_booking_status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'rescheduled').optional(),
  Status: Joi.boolean().optional()
});

const vendorBookingPaymentSchema = Joi.object({
  vendor_booking_id: Joi.number().integer().required().messages({
    'any.required': 'Vendor booking ID is required',
    'number.base': 'Vendor booking ID must be a number'
  }),
  payment_method_id: Joi.number().integer().required().messages({
    'any.required': 'Payment method ID is required',
    'number.base': 'Payment method ID must be a number'
  }),
  billingDetails: Joi.string().optional().allow('', null)
});

module.exports = {
  createVendorBookingSchema,
  updateVendorBookingSchema,
  getVendorBookingByIdSchema,
  queryVendorBookingSchema,
  vendorBookingPaymentSchema
};

