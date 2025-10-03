const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const walletSchema = new mongoose.Schema({
  wallet_id: {
    type: Number,
    unique: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    default: 0,
    min: [0, 'Amount cannot be negative']
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
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
    default: null
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

// Add auto-increment plugin
walletSchema.plugin(AutoIncrement, { inc_field: 'wallet_id' });

// Index for better performance
walletSchema.index({ user_id: 1 });
walletSchema.index({ wallet_id: 1 });

module.exports = mongoose.model('Wallet', walletSchema);
