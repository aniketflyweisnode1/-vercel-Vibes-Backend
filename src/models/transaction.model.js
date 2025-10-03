const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const transactionSchema = new mongoose.Schema({
  transaction_id: {
    type: Number,
    unique: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    required: [true, 'Payment method is required'],
    trim: true,
    maxlength: [50, 'Payment method cannot exceed 50 characters']
  },
  transactionType: {
    type: String,
    enum: ['Registration_fee', 'deposit', 'withdraw', 'RechargeByAdmin', 'Call', 'Package_Buy', 'Recharge'],
    required: [true, 'Transaction type is required']
  },
  transaction_date: {
    type: Date,
    default: Date.now
  },
  reference_number: {
    type: String,
    trim: true,
    maxlength: [100, 'Reference number cannot exceed 100 characters']
  },
  coupon_code_id: {
    type: Number,
    ref: 'CouponCode'
  },
  CGST: {
    type: Number,
    default: 0,
    min: [0, 'CGST cannot be negative']
  },
  SGST: {
    type: Number,
    default: 0,
    min: [0, 'SGST cannot be negative']
  },
  TotalGST: {
    type: Number,
    default: 0,
    min: [0, 'Total GST cannot be negative']
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  created_by: {
    type: Number,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  bank_id: {
    type: Number,
    ref: 'AdvisorBankAccountDetails'
  },
  isDownloaded: {
    type: Boolean,
    default: false
  },
  fileDownlodedPath: {
    type: String,
    default: null,
    trim: true,
    maxlength: [500, 'File download path cannot exceed 500 characters']
  },
  updated_by: {
    type: Number,
    ref: 'User',
    default: null
  }
}, {
  timestamps: false, // We're using custom timestamp fields
  versionKey: false
});

// Add auto-increment plugin
transactionSchema.plugin(AutoIncrement, { inc_field: 'transaction_id' });

// Index for better performance
transactionSchema.index({ transaction_id: 1 });
transactionSchema.index({ user_id: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ transactionType: 1 });
transactionSchema.index({ transaction_date: -1 });
transactionSchema.index({ created_at: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
