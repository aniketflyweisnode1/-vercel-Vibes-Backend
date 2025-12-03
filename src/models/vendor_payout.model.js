const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorPayoutSchema = new mongoose.Schema({
  Vendor_Payout_id: {
    type: Number,
    unique: true
  },
  Vendor_id: {
    type: Number,
    ref: 'User',
    required: [true, 'Vendor ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paymentType: {
    type: String,
    trim: true,
    maxlength: [50, 'Payment type cannot exceed 50 characters']
  },
  bank_branch_name_id: {
    type: Number,
    ref: 'BankBranchName',
    default: null
  },
  Event_Id: {
    type: Number,
    ref: 'Event',
    default: null
  },
  PendingAmount: {
    type: Number,
    default: 0,
    min: [0, 'Pending amount cannot be negative']
  },
  Status: {
    type: Boolean,
    default: true
  },
  CreateBy: {
    type: Number,
    ref: 'User',
    required: [true, 'Created by is required']
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

vendorPayoutSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Payout_id' });

module.exports = mongoose.model('Vendor_Payout', vendorPayoutSchema);

