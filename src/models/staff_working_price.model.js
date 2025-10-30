const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const staffWorkingPriceSchema = new mongoose.Schema({
  staff_working_price_id: {
    type: Number,
    unique: true
  },
  staff_id: {
    type: Number,
    ref: 'User',
    required: [true, 'Staff ID is required']
  },
  staff_category_id: {
    type: Number,
    ref: 'StaffCategory',
    required: [true, 'Staff Category ID is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    default: 0
  },
  review_count: {
    type: Number,
    default: 0,
    min: [0, 'Review Count cannot be negative']
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
  timestamps: false,
  versionKey: false
});

staffWorkingPriceSchema.plugin(AutoIncrement, { inc_field: 'staff_working_price_id' });

module.exports = mongoose.model('StaffWorkingPrice', staffWorkingPriceSchema);

