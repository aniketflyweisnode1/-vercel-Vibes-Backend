const Joi = require('joi');

// Create schema
const createVendorOnboardingPortalSchema = Joi.object({
 
  Basic_information_business_name: Joi.string().optional().allow('', null),
  Basic_information_LegalName: Joi.string().optional().allow('', null),
  Basic_information_Email: Joi.string().email().optional().allow('', null).messages({
    'string.email': 'Please enter a valid email address'
  }),
  Basic_information_phone: Joi.string().optional().allow('', null),
  Basic_information_Business_Description: Joi.string().optional().allow('', null),
  Basic_information_BusinessAddress: Joi.string().optional().allow('', null),
  Basic_information_City_id: Joi.number().optional().allow(null),
  Basic_information_State_id: Joi.number().optional().allow(null),
  Basic_information_ZipCode: Joi.string().optional().allow('', null),
  Basic_information_Country_id: Joi.number().optional().allow(null),
  Document_Business_Regis_Certificate: Joi.string().optional().allow('', null),
  Document_GSTTaxCertificate: Joi.string().optional().allow('', null),
  Document_Pan: Joi.string().optional().allow('', null),
  Document_bankbook: Joi.string().optional().allow('', null),
  Document_IDproofOwner: Joi.string().optional().allow('', null),
  Document_TradeLicense: Joi.string().optional().allow('', null),
  KYC_fullname: Joi.string().optional().allow('', null),
  KYC_DoB: Joi.date().optional().allow(null),
  KYC_GovtIdtype: Joi.string().optional().allow('', null),
  KYC_Idno: Joi.string().optional().allow('', null),
  KYC_Business_PanCard: Joi.string().optional().allow('', null),
  KYC_GSTNo: Joi.string().optional().allow('', null),
  KYC_UploadIdDocument: Joi.string().optional().allow('', null),
  KYC_photo: Joi.string().optional().allow('', null),
  service_areas_locaiton: Joi.string().optional().allow('', null),
  service_areas_Regions: Joi.string().optional().allow('', null),
  service_areas_pincode: Joi.string().optional().allow('', null),
  service_areas_workingHoures: Joi.string().optional().allow('', null),
  Payment_Setup_HolderName: Joi.string().optional().allow('', null),
  Payment_Setup_BankName: Joi.string().optional().allow('', null),
  Payment_Setup_BranchName: Joi.string().optional().allow('', null),
  Payment_Setup_AccountNo: Joi.string().optional().allow('', null),
  Payment_Setup_Ifsc: Joi.string().optional().allow('', null),
  Payment_Setup_UPI: Joi.string().optional().allow('', null),
  bank_branch_name_id: Joi.number().integer().optional().allow(null),
  service_categories: Joi.array().items(
    Joi.object({
      category_id: Joi.number().optional().allow(null),
      category_name: Joi.string().optional().allow('', null),
      pricing: Joi.number().optional().allow(null),
      pricing_currency: Joi.string().optional().allow('', null),
      Price: Joi.number().optional().allow(null),
      MinFee: Joi.number().optional().allow(null)
    })
  ).optional(),
  initial_payment_required: Joi.alternatives().try(
    Joi.boolean(),
    Joi.number()
  ).optional(),
  CancellationCharges: Joi.number().min(0).max(100).optional().allow(null),
  cancellation_policy: Joi.string().optional().allow('', null),
  refund_percentage: Joi.number().min(0).max(100).optional().allow(null),
  EscrowPayment: Joi.boolean().optional(),
  ifConfirm: Joi.boolean().optional(),
  Status: Joi.boolean().optional()
});

// Update schema
const updateVendorOnboardingPortalSchema = Joi.object({
  Vendor_Onboarding_Portal_id: Joi.number().required().messages({
    'any.required': 'Vendor Onboarding Portal ID is required',
    'number.base': 'Vendor Onboarding Portal ID must be a number'
  }),
  Basic_information_business_name: Joi.string().optional().allow('', null),
  Basic_information_LegalName: Joi.string().optional().allow('', null),
  Basic_information_Email: Joi.string().email().optional().allow('', null).messages({
    'string.email': 'Please enter a valid email address'
  }),
  Basic_information_phone: Joi.string().optional().allow('', null),
  Basic_information_Business_Description: Joi.string().optional().allow('', null),
  Basic_information_BusinessAddress: Joi.string().optional().allow('', null),
  Basic_information_City_id: Joi.number().optional().allow(null),
  Basic_information_State_id: Joi.number().optional().allow(null),
  Basic_information_ZipCode: Joi.string().optional().allow('', null),
  Basic_information_Country_id: Joi.number().optional().allow(null),
  Document_Business_Regis_Certificate: Joi.string().optional().allow('', null),
  Document_GSTTaxCertificate: Joi.string().optional().allow('', null),
  Document_Pan: Joi.string().optional().allow('', null),
  Document_bankbook: Joi.string().optional().allow('', null),
  Document_IDproofOwner: Joi.string().optional().allow('', null),
  Document_TradeLicense: Joi.string().optional().allow('', null),
  KYC_fullname: Joi.string().optional().allow('', null),
  KYC_DoB: Joi.date().optional().allow(null),
  KYC_GovtIdtype: Joi.string().optional().allow('', null),
  KYC_Idno: Joi.string().optional().allow('', null),
  KYC_Business_PanCard: Joi.string().optional().allow('', null),
  KYC_GSTNo: Joi.string().optional().allow('', null),
  KYC_UploadIdDocument: Joi.string().optional().allow('', null),
  KYC_photo: Joi.string().optional().allow('', null),
  service_areas_locaiton: Joi.string().optional().allow('', null),
  service_areas_Regions: Joi.string().optional().allow('', null),
  service_areas_pincode: Joi.string().optional().allow('', null),
  service_areas_workingHoures: Joi.string().optional().allow('', null),
  Payment_Setup_HolderName: Joi.string().optional().allow('', null),
  Payment_Setup_BankName: Joi.string().optional().allow('', null),
  Payment_Setup_BranchName: Joi.string().optional().allow('', null),
  Payment_Setup_AccountNo: Joi.string().optional().allow('', null),
  Payment_Setup_Ifsc: Joi.string().optional().allow('', null),
  Payment_Setup_UPI: Joi.string().optional().allow('', null),
  bank_branch_name_id: Joi.number().integer().optional().allow(null, ''),
  service_categories: Joi.array().items(
    Joi.object({
      category_id: Joi.number().optional().allow(null),
      category_name: Joi.string().optional().allow('', null),
      pricing: Joi.number().optional().allow(null),
      pricing_currency: Joi.string().optional().allow('', null),
      MinFee: Joi.number().optional().allow(null)
    })
  ).optional(),
  initial_payment_required: Joi.alternatives().try(
    Joi.boolean(),
    Joi.number()
  ).optional(),
  CancellationCharges: Joi.number().min(0).max(100).optional().allow(null),
  cancellation_policy: Joi.string().optional().allow('', null),
  refund_percentage: Joi.number().min(0).max(100).optional().allow(null),
  EscrowPayment: Joi.boolean().optional(),
  ifConfirm: Joi.boolean().optional(),
  Status: Joi.boolean().optional()
});

// Get by ID schema (params)
const getVendorOnboardingPortalByIdSchema = Joi.object({
  id: Joi.number().required().messages({
    'any.required': 'ID is required',
    'number.base': 'ID must be a number'
  })
});

// Query schema for getAll
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional().allow('', null),
  Vendor_id: Joi.number().optional(),
  Status: Joi.boolean().optional(),
  ifConfirm: Joi.boolean().optional()
});

// Delete schema
const deleteVendorOnboardingPortalSchema = Joi.object({
  id: Joi.number().required().messages({
    'any.required': 'ID is required',
    'number.base': 'ID must be a number'
  })
});

// Find vendors by category fee price schema
const findVendorbyCategoryfeePriceSchema = Joi.object({
  category_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Category ID must be a number',
    'number.integer': 'Category ID must be an integer',
    'number.positive': 'Category ID must be a positive number'
  }),
  Price: Joi.number().min(0).optional().messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price must be a positive number'
  }),
  city_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'City ID must be a number',
    'number.integer': 'City ID must be an integer',
    'number.positive': 'City ID must be a positive number'
  }),
  state_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'State ID must be a number',
    'number.integer': 'State ID must be an integer',
    'number.positive': 'State ID must be a positive number'
  }),
  country_id: Joi.number().integer().positive().optional().messages({
    'number.base': 'Country ID must be a number',
    'number.integer': 'Country ID must be an integer',
    'number.positive': 'Country ID must be a positive number'
  }),
  page: Joi.number().integer().min(1).optional().default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).optional().default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  })
});

// Create vendor portal schema (comprehensive schema for createvendorportal endpoint)
const createVendorPortalSchema = Joi.object({
  Basic_information_business_name: Joi.string().required().messages({
    'any.required': 'Business name is required',
    'string.base': 'Business name must be a string'
  }),
  Basic_information_LegalName: Joi.string().optional().allow('', null),
  Basic_information_Email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Please enter a valid email address'
  }),
  Basic_information_phone: Joi.string().optional().allow('', null),
  Basic_information_Business_Description: Joi.string().optional().allow('', null),
  Basic_information_BusinessAddress: Joi.string().optional().allow('', null),
  Basic_information_City_id: Joi.number().optional().allow(null),
  Basic_information_State_id: Joi.number().optional().allow(null),
  Basic_information_ZipCode: Joi.string().optional().allow('', null),
  Basic_information_Country_id: Joi.number().optional().allow(null),
  Document_Business_Regis_Certificate: Joi.string().optional().allow('', null),
  Document_GSTTaxCertificate: Joi.string().optional().allow('', null),
  Document_Pan: Joi.string().optional().allow('', null),
  Document_bankbook: Joi.string().optional().allow('', null),
  Document_IDproofOwner: Joi.string().optional().allow('', null),
  Document_TradeLicense: Joi.string().optional().allow('', null),
  KYC_fullname: Joi.string().optional().allow('', null),
  KYC_DoB: Joi.date().optional().allow(null),
  KYC_GovtIdtype: Joi.string().optional().allow('', null),
  KYC_Idno: Joi.string().optional().allow('', null),
  KYC_Business_PanCard: Joi.string().optional().allow('', null),
  KYC_GSTNo: Joi.string().optional().allow('', null),
  KYC_UploadIdDocument: Joi.string().optional().allow('', null),
  KYC_photo: Joi.string().optional().allow('', null),
  service_areas_locaiton: Joi.string().optional().allow('', null),
  service_areas_Regions: Joi.string().optional().allow('', null),
  service_areas_pincode: Joi.string().optional().allow('', null),
  service_areas_workingHoures: Joi.string().optional().allow('', null),
  Payment_Setup_HolderName: Joi.string().optional().allow('', null),
  Payment_Setup_BankName: Joi.string().optional().allow('', null),
  Payment_Setup_BranchName: Joi.string().optional().allow('', null),
  Payment_Setup_AccountNo: Joi.string().optional().allow('', null),
  Payment_Setup_Ifsc: Joi.string().optional().allow('', null),
  Payment_Setup_UPI: Joi.string().optional().allow('', null),
  bank_name_id: Joi.number().integer().optional().allow(null),
  service_categories: Joi.array().items(
    Joi.object({
      category_id: Joi.number().required().messages({
        'any.required': 'category_id is required',
        'number.base': 'category_id must be a number'
      }),
      pricing_currency: Joi.string().optional().allow('', null),
      Price: Joi.number().required().messages({
        'any.required': 'Price is required',
        'number.base': 'Price must be a number'
      }),
      MinFee: Joi.number().optional().allow(null)
    })
  ).optional(),
  CancellationCharges: Joi.number().min(0).max(100).optional().allow(null),
  cancellation_policy: Joi.string().optional().allow('', null),
  refund_percentage: Joi.number().min(0).max(100).optional().allow(null),
  EscrowPayment: Joi.boolean().optional(),
  ifConfirm: Joi.boolean().optional(),
  Status: Joi.boolean().optional()
});

module.exports = {
  createVendorOnboardingPortalSchema,
  createVendorPortalSchema,
  updateVendorOnboardingPortalSchema,
  getVendorOnboardingPortalByIdSchema,
  querySchema,
  deleteVendorOnboardingPortalSchema,
  findVendorbyCategoryfeePriceSchema
};

