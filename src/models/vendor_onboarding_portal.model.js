const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorOnboardingPortalSchema = new mongoose.Schema({
  Vendor_Onboarding_Portal_id: {
    type: Number,
    unique: true
  },
  Vendor_id: {
    type: Number,
    ref: 'User',
    required: [true, 'Vendor ID is required']
  },
  // Basic Information Section
  Basic_information_business_name: {
    type: String,
    trim: true
  },
  Basic_information_LegalName: {
    type: String,
    trim: true
  },
  Basic_information_Email: {
    type: String,
    trim: true,
    lowercase: true
  },
  Basic_information_phone: {
    type: String,
    trim: true
  },
  Basic_information_Business_Description: {
    type: String,
    trim: true
  },
  Basic_information_BusinessAddress: {
    type: String,
    trim: true
  },
  Basic_information_City_id: {
    type: Number,
    ref: 'City'
  },
  Basic_information_State_id: {
    type: Number,
    ref: 'State'
  },
  Basic_information_ZipCode: {
    type: String,
    trim: true
  },
  Basic_information_Country_id: {
    type: Number,
    ref: 'Country'
  },
  // Document Section
  Document_Business_Regis_Certificate: {
    type: String,
    trim: true
  },
  Document_GSTTaxCertificate: {
    type: String,
    trim: true
  },
  Document_Pan: {
    type: String,
    trim: true
  },
  Document_bankbook: {
    type: String,
    trim: true
  },
  Document_IDproofOwner: {
    type: String,
    trim: true
  },
  Document_TradeLicense: {
    type: String,
    trim: true
  },
  // KYC Section
  KYC_fullname: {
    type: String,
    trim: true
  },
  KYC_DoB: {
    type: Date
  },
  KYC_GovtIdtype: {
    type: String,
    trim: true
  },
  KYC_Idno: {
    type: String,
    trim: true
  },
  KYC_Business_PanCard: {
    type: String,
    trim: true
  },
  KYC_GSTNo: {
    type: String,
    trim: true
  },
  KYC_UploadIdDocument: {
    type: String,
    trim: true
  },
  KYC_photo: {
    type: String,
    trim: true
  },
  // Service Areas Section
  service_areas_locaiton: {
    type: String,
    trim: true
  },
  service_areas_Regions: {
    type: String,
    trim: true
  },
  service_areas_pincode: {
    type: String,
    trim: true
  },
  service_areas_workingHoures: {
    type: String,
    trim: true
  },
  // Payment Setup Section
  Payment_Setup_HolderName: {
    type: String,
    trim: true
  },
  Payment_Setup_BankName: {
    type: String,
    trim: true
  },
  Payment_Setup_BranchName: {
    type: String,
    trim: true
  },
  Payment_Setup_AccountNo: {
    type: String,
    trim: true
  },
  Payment_Setup_Ifsc: {
    type: String,
    trim: true
  },
  Payment_Setup_UPI: {
    type: String,
    trim: true
  },
  // Status Fields
  ifConfirm: {
    type: Boolean,
    default: false
  },
  Status: {
    type: Boolean,
    default: true
  },
  // Audit Fields
  CreateBy: {
    type: Number,
    ref: 'User',
    required: true
  },
  CreateAt: {
    type: Date,
    default: Date.now
  },
  UpdatedBy: {
    type: Number,
    ref: 'User',
    default: null
  },
  UpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false, // We're using custom timestamp fields
  versionKey: false
});

vendorOnboardingPortalSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Onboarding_Portal_id' });

module.exports = mongoose.model('Vendor_Onboarding_Portal', vendorOnboardingPortalSchema);

