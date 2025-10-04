const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const bankBranchNameSchema = new mongoose.Schema({
  bank_branch_name_id: {
    type: Number,
    unique: true
  },
  bank_branch_name: {
    type: String,
    required: [true, 'Bank branch name is required'],
    trim: true,
    maxlength: [100, 'Bank branch name cannot exceed 100 characters']
  },
  bank_name_id: {
    type: Number,
    ref: 'BankName',
    required: [true, 'Bank name is required']
  },
  holderName: {
    type: String,
    required: [true, 'Holder name is required'],
    trim: true,
    maxlength: [100, 'Holder name cannot exceed 100 characters']
  },
  upi: {
    type: String,
    trim: true,
    maxlength: [50, 'UPI ID cannot exceed 50 characters']
  },
  ifsc: {
    type: String,
    trim: true,
    maxlength: [11, 'IFSC code cannot exceed 11 characters']
  },
  accountNo: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true,
    maxlength: [20, 'Account number cannot exceed 20 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  cardNo: {
    type: String,
    trim: true,
    maxlength: [19, 'Card number cannot exceed 19 characters']
  },
  zipcode: {
    type: String,
    required: [true, 'Zipcode is required'],
    trim: true,
    maxlength: [10, 'Zipcode cannot exceed 10 characters']
  },
  emoji: {
    type: String,
    trim: true,
    maxlength: [10, 'Emoji cannot exceed 10 characters']
  },
  status: {
    type: Boolean,
    default: true
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
  timestamps: false, // We're using custom timestamp fields
  versionKey: false
});

bankBranchNameSchema.plugin(AutoIncrement, { inc_field: 'bank_branch_name_id' });

module.exports = mongoose.model('BankBranchName', bankBranchNameSchema);
