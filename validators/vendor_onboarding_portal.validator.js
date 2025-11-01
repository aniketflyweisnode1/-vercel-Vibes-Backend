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

module.exports = {
  createVendorOnboardingPortalSchema,
  updateVendorOnboardingPortalSchema,
  getVendorOnboardingPortalByIdSchema,
  querySchema,
  deleteVendorOnboardingPortalSchema
};

