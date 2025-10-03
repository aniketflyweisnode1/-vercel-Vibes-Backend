const Joi = require('joi');

/**
 * Vendor Business Information validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  business_name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Business name is required',
      'string.min': 'Business name must be at least 2 characters long',
      'string.max': 'Business name cannot exceed 200 characters'
    }),

  business_email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Business email is required',
      'string.email': 'Please enter a valid email address'
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),

  business_phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Business phone is required',
      'string.pattern.base': 'Please enter a valid 10-digit phone number'
    }),

  business_website_url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please enter a valid URL starting with http:// or https://'
    }),

  business_socialmedia_url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please enter a valid URL starting with http:// or https://'
    }),

  business_logo_url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please enter a valid URL starting with http:// or https://'
    }),

  vendor_categories: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'Vendor categories must be an array',
      'number.base': 'Each vendor category must be a number',
      'number.integer': 'Each vendor category must be an integer',
      'number.positive': 'Each vendor category must be a positive number'
    }),

  service_location: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Service location cannot exceed 500 characters'
    }),

  service_radius: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Service radius must be a number',
      'number.min': 'Service radius must be a positive number'
    }),

  willing_to_travel: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Willing to travel must be a boolean value'
    }),

  service_days: Joi.array()
    .items(Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'))
    .optional()
    .messages({
      'array.base': 'Service days must be an array',
      'any.only': 'Service days must be valid day names'
    }),

  pricing_booking_minimum_fee: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Minimum fee must be a number',
      'number.min': 'Minimum fee must be a positive number'
    }),

  price_range_min: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Minimum price must be a number',
      'number.min': 'Minimum price must be a positive number'
    }),

  price_range_max: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Maximum price must be a number',
      'number.min': 'Maximum price must be a positive number'
    }),

  deposit_required_for_bookings: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Deposit required must be a boolean value'
    }),

  payment_methods: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'Payment methods must be an array',
      'number.base': 'Each payment method must be a number',
      'number.integer': 'Each payment method must be an integer',
      'number.positive': 'Each payment method must be a positive number'
    }),

  link_to_reviews: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please enter a valid URL starting with http:// or https://'
    }),

  promo_video_url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please enter a valid URL starting with http:// or https://'
    }),

  client_testimonials: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Client testimonials cannot exceed 2000 characters'
    }),

  calendar_integration: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Calendar integration cannot exceed 500 characters'
    }),

  business_license_url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please enter a valid URL starting with http:// or https://'
    }),

  term_verification: Joi.array()
    .items(Joi.object({
      term: Joi.string().required(),
      status: Joi.boolean().default(false)
    }))
    .optional()
    .messages({
      'array.base': 'Term verification must be an array',
      'object.base': 'Each term verification must be an object'
    }),

  approval_by_admin: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Approval by admin must be a boolean value'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create vendor business information validation schema
const createVendorBusinessInformationSchema = Joi.object({
  vendor_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Vendor ID must be a number',
      'number.integer': 'Vendor ID must be an integer',
      'number.positive': 'Vendor ID must be a positive number'
    }),
  business_name: commonValidations.business_name,
  business_email: commonValidations.business_email,
  description: commonValidations.description,
  business_phone: commonValidations.business_phone,
  business_website_url: commonValidations.business_website_url,
  business_socialmedia_url: commonValidations.business_socialmedia_url,
  business_logo_url: commonValidations.business_logo_url,
  vendor_categories: commonValidations.vendor_categories,
  service_location: commonValidations.service_location,
  service_radius: commonValidations.service_radius,
  willing_to_travel: commonValidations.willing_to_travel,
  service_days: commonValidations.service_days,
  pricing_booking_minimum_fee: commonValidations.pricing_booking_minimum_fee,
  price_range_min: commonValidations.price_range_min,
  price_range_max: commonValidations.price_range_max,
  deposit_required_for_bookings: commonValidations.deposit_required_for_bookings,
  payment_methods: commonValidations.payment_methods,
  link_to_reviews: commonValidations.link_to_reviews,
  promo_video_url: commonValidations.promo_video_url,
  client_testimonials: commonValidations.client_testimonials,
  calendar_integration: commonValidations.calendar_integration,
  business_license_url: commonValidations.business_license_url,
  term_verification: commonValidations.term_verification,
  approval_by_admin: commonValidations.approval_by_admin,
  status: commonValidations.status
});

// Update vendor business information validation schema
const updateVendorBusinessInformationSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Business information ID must be a number',
      'number.integer': 'Business information ID must be an integer',
      'number.positive': 'Business information ID must be a positive number',
      'any.required': 'Business information ID is required'
    }),
  vendor_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Vendor ID must be a number',
      'number.integer': 'Vendor ID must be an integer',
      'number.positive': 'Vendor ID must be a positive number'
    }),
  business_name: commonValidations.business_name.optional(),
  business_email: commonValidations.business_email.optional(),
  description: commonValidations.description.optional(),
  business_phone: commonValidations.business_phone.optional(),
  business_website_url: commonValidations.business_website_url.optional(),
  business_socialmedia_url: commonValidations.business_socialmedia_url.optional(),
  business_logo_url: commonValidations.business_logo_url.optional(),
  vendor_categories: commonValidations.vendor_categories.optional(),
  service_location: commonValidations.service_location.optional(),
  service_radius: commonValidations.service_radius.optional(),
  willing_to_travel: commonValidations.willing_to_travel.optional(),
  service_days: commonValidations.service_days.optional(),
  pricing_booking_minimum_fee: commonValidations.pricing_booking_minimum_fee.optional(),
  price_range_min: commonValidations.price_range_min.optional(),
  price_range_max: commonValidations.price_range_max.optional(),
  deposit_required_for_bookings: commonValidations.deposit_required_for_bookings.optional(),
  payment_methods: commonValidations.payment_methods.optional(),
  link_to_reviews: commonValidations.link_to_reviews.optional(),
  promo_video_url: commonValidations.promo_video_url.optional(),
  client_testimonials: commonValidations.client_testimonials.optional(),
  calendar_integration: commonValidations.calendar_integration.optional(),
  business_license_url: commonValidations.business_license_url.optional(),
  term_verification: commonValidations.term_verification.optional(),
  approval_by_admin: commonValidations.approval_by_admin.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get vendor business information by ID validation schema
const getVendorBusinessInformationByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Business information ID must be a number',
      'number.integer': 'Business information ID must be an integer',
      'number.positive': 'Business information ID must be a positive number'
    })
});

// Get all vendor business information query validation schema
const getAllVendorBusinessInformationSchema = Joi.object({
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
  approval_by_admin: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Approval by admin must be a boolean value'
    }),
  sortBy: Joi.string()
    .valid('business_name', 'business_email', 'created_at', 'updated_at', 'approval_by_admin')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: business_name, business_email, created_at, updated_at, approval_by_admin'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Update vendor business information by ID with ID in body validation schema
const updateVendorBusinessInformationByIdBodySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Business information ID must be a number',
      'number.integer': 'Business information ID must be an integer',
      'number.positive': 'Business information ID must be a positive number'
    }),
  vendor_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Vendor ID must be a number',
      'number.integer': 'Vendor ID must be an integer',
      'number.positive': 'Vendor ID must be a positive number'
    }),
  business_name: commonValidations.business_name.optional(),
  business_email: commonValidations.business_email.optional(),
  description: commonValidations.description.optional(),
  business_phone: commonValidations.business_phone.optional(),
  business_website_url: commonValidations.business_website_url.optional(),
  business_socialmedia_url: commonValidations.business_socialmedia_url.optional(),
  business_logo_url: commonValidations.business_logo_url.optional(),
  vendor_categories: commonValidations.vendor_categories.optional(),
  service_location: commonValidations.service_location.optional(),
  service_radius: commonValidations.service_radius.optional(),
  willing_to_travel: commonValidations.willing_to_travel.optional(),
  service_days: commonValidations.service_days.optional(),
  pricing_booking_minimum_fee: commonValidations.pricing_booking_minimum_fee.optional(),
  price_range_min: commonValidations.price_range_min.optional(),
  price_range_max: commonValidations.price_range_max.optional(),
  deposit_required_for_bookings: commonValidations.deposit_required_for_bookings.optional(),
  payment_methods: commonValidations.payment_methods.optional(),
  link_to_reviews: commonValidations.link_to_reviews.optional(),
  promo_video_url: commonValidations.promo_video_url.optional(),
  client_testimonials: commonValidations.client_testimonials.optional(),
  calendar_integration: commonValidations.calendar_integration.optional(),
  business_license_url: commonValidations.business_license_url.optional(),
  term_verification: commonValidations.term_verification.optional(),
  approval_by_admin: commonValidations.approval_by_admin.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

module.exports = {
  createVendorBusinessInformationSchema,
  updateVendorBusinessInformationSchema,
  updateVendorBusinessInformationByIdBodySchema,
  getVendorBusinessInformationByIdSchema,
  getAllVendorBusinessInformationSchema
};
