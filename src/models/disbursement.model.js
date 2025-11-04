const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const disbursementSchema = new mongoose.Schema({
  disbursement_id: {
    type: Number,
    unique: true
  },
  vibe_fund_campaign_id: {
    type: Number,
    ref: 'VibeFundCampaign',
    required: [true, 'Campaign ID is required']
  },
  beneficiary_user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'Beneficiary user ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be a positive number']
  },
  bank_name_id: {
    type: Number,
    ref: 'BankName',
    required: [true, 'Bank name ID is required']
  },
  bank_branch_id: {
    type: Number,
    ref: 'BankBranchName'
  },
  bank_account_no: {
    type: String,
    trim: true,
    maxlength: [20, 'Bank account number cannot exceed 20 characters']
  },
  bank_account_holder_name: {
    type: String,
    trim: true,
    maxlength: [100, 'Bank account holder name cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed'],
    default: 'pending'
  },
  request_date: {
    type: Date,
    default: Date.now
  },
  processed_date: {
    type: Date,
    default: null
  },
  created_by: {
    type: Number,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: Number,
    ref: 'User',
    default: null
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  versionKey: false
});

disbursementSchema.plugin(AutoIncrement, { inc_field: 'disbursement_id' });

module.exports = mongoose.model('Disbursement', disbursementSchema);

