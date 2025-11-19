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
  }
}, {
  timestamps: false, // We're using custom timestamp fields
  versionKey: false
});

vendorOnboardingPortalSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Onboarding_Portal_id' });

module.exports = mongoose.model('Vendor_Onboarding_Portal', vendorOnboardingPortalSchema);

