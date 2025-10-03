const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const entertainmentSchema = new mongoose.Schema({
  entertainment_id: {
    type: Number,
    unique: true
  },
  entertainment_name: {
    type: String,
    required: [true, 'Entertainment name is required'],
    trim: true,
    maxlength: [200, 'Entertainment name cannot exceed 200 characters']
  },
  entertainment_price: {
    type: Number,
    required: [true, 'Entertainment price is required'],
    min: [0, 'Entertainment price must be a positive number']
  },
  entertainment_type: {
    type: String,
    trim: true,
    maxlength: [100, 'Entertainment type cannot exceed 100 characters']
  },
  brand_name: {
    type: String,
    trim: true,
    maxlength: [200, 'Brand name cannot exceed 200 characters']
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

entertainmentSchema.plugin(AutoIncrement, { inc_field: 'entertainment_id' });

module.exports = mongoose.model('Entertainment', entertainmentSchema);

