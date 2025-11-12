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

