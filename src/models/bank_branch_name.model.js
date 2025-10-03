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
