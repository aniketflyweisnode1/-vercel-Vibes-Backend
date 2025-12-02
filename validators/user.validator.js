const Joi = require('joi');

/**
 * User validation schemas using Joi
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

  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit mobile number'
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters'
    }),

  address: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 10 characters long',
      'string.max': 'Address cannot exceed 500 characters'
    }),

  country_id: Joi.number()
    .integer()
    .positive()
    .default(1)
    .optional()
    .messages({
      'number.base': 'Country ID must be a number',
      'number.integer': 'Country ID must be an integer',
      'number.positive': 'Country ID must be a positive number'
    }),

  state_id: Joi.number()
    .integer()
    .positive()
    .default(1)
    .optional()
    .messages({
      'number.base': 'State ID must be a number',
      'number.integer': 'State ID must be an integer',
      'number.positive': 'State ID must be a positive number'
    }),

  city_id: Joi.number()
    .integer()
    .positive()
    .default(1)
    .optional()
    .messages({
      'number.base': 'City ID must be a number',
      'number.integer': 'City ID must be an integer',
      'number.positive': 'City ID must be a positive number'
    }),

  role_id: Joi.number()
    .integer()
    .positive()
    .default(1)
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Role ID must be a number',
      'number.integer': 'Role ID must be an integer',
      'number.positive': 'Role ID must be a positive number'
    }),

  online_status: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Online status must be a boolean value'
    }),

  gender: Joi.string()
    .valid('male', 'female', 'other')
    .required()
    .messages({
      'string.empty': 'Gender is required',
      'any.only': 'Gender must be one of: male, female, other'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),

  user_img: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please enter a valid URL starting with http:// or https://'
    }),

  postal_code: Joi.string()
    .trim()
    .max(10)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Postal code cannot exceed 10 characters'
    }),

  business_name: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Business name cannot exceed 200 characters'
    }),

  business_category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Business category ID must be a number',
      'number.integer': 'Business category ID must be an integer',
      'number.positive': 'Business category ID must be a positive number'
    }),

  whatsapp_no: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit WhatsApp number'
    }),

  business_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Business type ID must be a number',
      'number.integer': 'Business type ID must be an integer',
      'number.positive': 'Business type ID must be a positive number'
    }),

  business_website: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please enter a valid URL starting with http:// or https://'
    }),

  business_reg_no: Joi.string()
    .trim()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Business registration number cannot exceed 50 characters'
    }),

  business_description: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Business description cannot exceed 1000 characters'
    }),

  business_address: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Business address cannot exceed 500 characters'
    }),

  id_proof_owner_img: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please enter a valid URL starting with http:// or https://'
    }),

  licenses_certificate_file: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please enter a valid URL starting with http:// or https://'
    }),

  bank_account_holder_name: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Bank account holder name cannot exceed 100 characters'
    }),

  bank_name_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Bank name ID must be a number',
      'number.integer': 'Bank name ID must be an integer',
      'number.positive': 'Bank name ID must be a positive number'
    }),

  bank_account_no: Joi.string()
    .trim()
    .max(20)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Bank account number cannot exceed 20 characters'
    }),

  bank_branch_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .allow(null)
    .messages({
      'number.base': 'Bank branch ID must be a number',
      'number.integer': 'Bank branch ID must be an integer',
      'number.positive': 'Bank branch ID must be a positive number'
    })
};

// Create user validation schema
const createUserSchema = Joi.object({
  name: commonValidations.name,
  email: commonValidations.email,
  password: commonValidations.password,
  agreePrivacyPolicy: Joi.boolean()
    .default(false)
    .optional()
    .messages({
      'boolean.base': 'Agree Privacy Policy must be a boolean value'
    }),
  mobile: commonValidations.mobile,
  address: commonValidations.address.optional(),
  country_id: commonValidations.country_id,
  state_id: commonValidations.state_id,
  city_id: commonValidations.city_id,
  role_id: commonValidations.role_id,
  online_status: commonValidations.online_status,
  gender: commonValidations.gender.optional(),
  user_img: commonValidations.user_img,
  postal_code: commonValidations.postal_code,
  business_name: commonValidations.business_name,
  business_category_id: commonValidations.business_category_id,
  whatsapp_no: commonValidations.whatsapp_no,
  business_type_id: commonValidations.business_type_id,
  business_website: commonValidations.business_website,
  business_reg_no: commonValidations.business_reg_no,
  business_description: commonValidations.business_description,
  business_address: commonValidations.business_address,
  id_proof_owner_img: commonValidations.id_proof_owner_img,
  licenses_certificate_file: commonValidations.licenses_certificate_file,
  bank_account_holder_name: commonValidations.bank_account_holder_name,
  bank_name_id: commonValidations.bank_name_id,
  bank_account_no: commonValidations.bank_account_no,
  bank_branch_id: commonValidations.bank_branch_id,
  status: commonValidations.status
});

// Update user validation schema
const updateUserSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number',
      'any.required': 'User ID is required'
    }),
  name: commonValidations.name.optional(),
  mobile: commonValidations.mobile.optional(),
  email: commonValidations.email.optional(),
  password: commonValidations.password.optional(),
  address: commonValidations.address.optional(),
  country_id: commonValidations.country_id.optional(),
  state_id: commonValidations.state_id.optional(),
  city_id: commonValidations.city_id.optional(),
  role_id: commonValidations.role_id.optional(),
  online_status: commonValidations.online_status.optional(),
  gender: commonValidations.gender.optional(),
  user_img: commonValidations.user_img.optional(),
  postal_code: commonValidations.postal_code.optional(),
  business_name: commonValidations.business_name.optional(),
  business_category_id: commonValidations.business_category_id.optional(),
  whatsapp_no: commonValidations.whatsapp_no.optional(),
  business_type_id: commonValidations.business_type_id.optional(),
  business_website: commonValidations.business_website.optional(),
  business_reg_no: commonValidations.business_reg_no.optional(),
  business_description: commonValidations.business_description.optional(),
  business_address: commonValidations.business_address.optional(),
  id_proof_owner_img: commonValidations.id_proof_owner_img.optional(),
  licenses_certificate_file: commonValidations.licenses_certificate_file.optional(),
  bank_account_holder_name: commonValidations.bank_account_holder_name.optional(),
  bank_name_id: commonValidations.bank_name_id.optional(),
  bank_account_no: commonValidations.bank_account_no.optional(),
  bank_branch_id: commonValidations.bank_branch_id.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Login validation schema (now only requires email for OTP flow)
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    })
});

// Get user by ID validation schema
const getUserByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    })
});

// Get all users query validation schema
const getAllUsersSchema = Joi.object({
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
    .valid('name', 'email', 'gender', 'online_status', 'business_name', 'business_type_id', 'business_category_id', 'created_on', 'updated_on')
    .default('created_on')
    .messages({
      'any.only': 'Sort by must be one of: name, email, gender, online_status, business_name, business_type_id, business_category_id, created_on, updated_on'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Update user by ID with ID in body validation schema
const updateUserByIdBodySchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number'
    }),
  name: commonValidations.name.optional(),
  mobile: commonValidations.mobile.optional(),
  email: commonValidations.email.optional(),
  password: commonValidations.password.optional(),
  address: commonValidations.address.optional(),
  country_id: commonValidations.country_id.optional(),
  state_id: commonValidations.state_id.optional(),
  city_id: commonValidations.city_id.optional(),
  role_id: commonValidations.role_id.optional(),
  online_status: commonValidations.online_status.optional(),
  gender: commonValidations.gender.optional(),
  user_img: commonValidations.user_img.optional(),
  postal_code: commonValidations.postal_code.optional(),
  business_name: commonValidations.business_name.optional(),
  business_category_id: commonValidations.business_category_id.optional(),
  whatsapp_no: commonValidations.whatsapp_no.optional(),
  business_type_id: commonValidations.business_type_id.optional(),
  business_website: commonValidations.business_website.optional(),
  business_reg_no: commonValidations.business_reg_no.optional(),
  business_description: commonValidations.business_description.optional(),
  business_address: commonValidations.business_address.optional(),
  id_proof_owner_img: commonValidations.id_proof_owner_img.optional(),
  licenses_certificate_file: commonValidations.licenses_certificate_file.optional(),
  bank_account_holder_name: commonValidations.bank_account_holder_name.optional(),
  bank_name_id: commonValidations.bank_name_id.optional(),
  bank_account_no: commonValidations.bank_account_no.optional(),
  bank_branch_id: commonValidations.bank_branch_id.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field (other than ID) must be provided for update'
});

// Change password validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Current password is required'
    }),
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 128 characters'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'string.empty': 'Confirm password is required',
      'any.only': 'Confirm password must match new password'
    })
});

// Send OTP validation schema
const sendOTPSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    })
});

// Verify OTP validation schema
const verifyOTPSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    }),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.empty': 'OTP is required',
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
      'any.required': 'OTP is required'
    })
});

// Get users by role ID validation schema
const getUsersByRoleIdSchema = Joi.object({
  role_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Role ID must be a number',
      'number.integer': 'Role ID must be an integer',
      'number.positive': 'Role ID must be a positive number',
      'any.required': 'Role ID is required'
    })
});

// Get users by role ID query validation schema
const getUsersByRoleIdQuerySchema = Joi.object({
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
    .valid('name', 'email', 'gender', 'online_status', 'business_name', 'business_type_id', 'business_category_id', 'created_on', 'updated_on')
    .default('created_on')
    .messages({
      'any.only': 'Sort by must be one of: name, email, gender, online_status, business_name, business_type_id, business_category_id, created_on, updated_on'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

// Forgot password validation schema
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    })
});

// Reset password validation schema
const resetPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    }),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.empty': 'OTP is required',
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must be 6 digits'
    }),
  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 128 characters'
    })
});

// Test email validation schema
const testEmailSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    }),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .optional()
    .messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must be 6 digits'
    }),
  userName: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'User name must be at least 1 character long',
      'string.max': 'User name cannot exceed 100 characters'
    })
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateUserByIdBodySchema,
  loginSchema,
  getUserByIdSchema,
  getAllUsersSchema,
  changePasswordSchema,
  sendOTPSchema,
  verifyOTPSchema,
  getUsersByRoleIdSchema,
  getUsersByRoleIdQuerySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  testEmailSchema
};
