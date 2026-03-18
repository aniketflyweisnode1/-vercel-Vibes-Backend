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
  business_information_id: {
    type: Number,
    ref: 'VendorBusinessInformation',
    default: null
  },
  // Payment Setup Section
  bank_branch_name_id: {
    type: Number,
    ref: 'BankBranchName',
    default: null
  },
  categories_fees_id: {
    type: [Number],
    ref: 'CategoriesFees',
    default: []
  },
  initial_payment_required: {
    type: Boolean,
    default: false
  },
  CancellationCharges: {
    type: Number,
    default: 0,
    min: [0, 'Cancellation charges cannot be negative'],
    max: [100, 'Cancellation charges cannot exceed 100%']
  },
  cancellation_policy: {
    type: String,
    default: null,
    trim: true
  },
  refund_percentage: {
    type: Number,
    default: 0,
    min: [0, 'Refund percentage cannot be negative'],
    max: [100, 'Refund percentage cannot exceed 100%']
  },
  EscrowPayment: {
    type: Boolean,
    default: false
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
  },
  bank_account_holder_name: {
    type: String,
    trim: true,
    maxlength: [100, 'Bank account holder name cannot exceed 100 characters']
  },
  bank_account_no: {
    type: String,
    trim: true,
    maxlength: [20, 'Bank account number cannot exceed 20 characters']
  },
  bank_name: {
    type: String,
    trim: true,
    maxlength: [20, 'Bank name cannot exceed 20 characters']
  },
  routing_Number: {
    type: String,
    trim: true,
    maxlength: [20, 'Routing number cannot exceed 20 characters']
  },
  bank_Address: {
    type: String,
    trim: true,
    maxlength: [20, 'Routing number cannot exceed 20 characters']
  },
  bank_name_id: {
    type: Number,
    ref: 'BankName'
  },


  business_type: {
    type: String,
    trim: true,
    maxlength: [500, 'Business Type cannot exceed 500 characters']
  },
  business_reg_no: {
    type: String,
    trim: true,
    maxlength: [50, 'Business registration number cannot exceed 50 characters']
  },
  State_of_registration: {
    type: String,
    trim: true,
    maxlength: [50, 'State of registration cannot exceed 50 characters']
  },
  Certificate_of_Incorporation: {
    type: String,
    trim: true,
    maxlength: [50, 'Certificate of Incorporation cannot exceed 50 characters']
  },
  Business_License: {
    type: String,
    trim: true,
    maxlength: [50, 'Business License cannot exceed 50 characters']
  },
}, {
  timestamps: false, // We're using custom timestamp fields
  versionKey: false
});

vendorOnboardingPortalSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Onboarding_Portal_id' });

module.exports = mongoose.model('Vendor_Onboarding_Portal', vendorOnboardingPortalSchema);

