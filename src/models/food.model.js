const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const foodSchema = new mongoose.Schema({
  food_id: {
    type: Number,
    unique: true
  },
  food_name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
    maxlength: [200, 'Food name cannot exceed 200 characters']
  },
  food_price: {
    type: Number,
    required: [true, 'Food price is required'],
    min: [0, 'Food price must be a positive number']
  },
  food_color: {
    type: String,
    trim: true,
    maxlength: [50, 'Food color cannot exceed 50 characters']
  },
  food_type: {
    type: String,
    trim: true,
    maxlength: [100, 'Food type cannot exceed 100 characters']
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

foodSchema.plugin(AutoIncrement, { inc_field: 'food_id' });

module.exports = mongoose.model('Food', foodSchema);

