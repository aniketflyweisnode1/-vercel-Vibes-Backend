const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const couponCodeSchema = new mongoose.Schema({
  coupon_code_id: {
    type: Number,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Code cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  min_order_amount: {
    type: Number,
    required: [true, 'Minimum order amount is required'],
    min: [0, 'Minimum order amount cannot be negative']
  },
  max_discount_amount: {
    type: Number,
    required: [true, 'Maximum discount amount is required'],
    min: [0, 'Maximum discount amount cannot be negative']
  },
  usage_limit: {
    type: Number,
    required: [true, 'Usage limit is required'],
    min: [1, 'Usage limit must be at least 1']
  },
  used_count: {
    type: Number,
    default: 0,
    min: [0, 'Used count cannot be negative']
  },
  valid_from: {
    type: Date,
    required: [true, 'Valid from date is required']
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
couponCodeSchema.plugin(AutoIncrement, { inc_field: 'coupon_code_id' });

// Index for better performance
couponCodeSchema.index({ coupon_code_id: 1 });
couponCodeSchema.index({ code: 1 });
couponCodeSchema.index({ name: 1 });
couponCodeSchema.index({ status: 1 });
couponCodeSchema.index({ valid_from: 1 });
couponCodeSchema.index({ valid_until: 1 });

module.exports = mongoose.model('CouponCode', couponCodeSchema);
