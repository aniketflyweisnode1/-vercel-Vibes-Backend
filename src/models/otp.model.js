const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const otpSchema = new mongoose.Schema({
  otp_id: {
    type: Number,
    unique: true
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: 6,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  otp_type: {
    type: Number,
    ref: 'OtpType',
    required: [true, 'OTP type is required']
  },
  expires_at: {
    type: Date,
    required: [true, 'Expiration time is required'],
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  },
  is_used: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Number,
    ref: 'User',
    default: null // Can be null for login OTPs
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

// Add indexes for better performance
otpSchema.index({ email: 1, otp_type: 1 });
otpSchema.index({ expires_at: 1 });
otpSchema.index({ created_at: 1 });

// Add method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return new Date() > this.expires_at;
};

// Add method to check if OTP is valid (not expired and not used)
otpSchema.methods.isValid = function() {
  return !this.isExpired() && !this.is_used && this.status;
};

otpSchema.plugin(AutoIncrement, { inc_field: 'otp_id' });

module.exports = mongoose.model('OTP', otpSchema);
