const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const categoriesFeesSchema = new mongoose.Schema({
  categories_fees_id: {
    type: Number,
    unique: true
  },
  categoryName: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [200, 'Category name cannot exceed 200 characters']
  },
  PlatformFee: {
    type: Number,
    required: [true, 'Platform fee is required'],
    min: [0, 'Platform fee must be a positive number']
  },
  ProcessingFee: {
    type: Number,
    required: [true, 'Processing fee is required'],
    min: [0, 'Processing fee must be a positive number']
  },
  MinFee: {
    type: Number,
    required: [true, 'Minimum fee is required'],
    min: [0, 'Minimum fee must be a positive number']
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

categoriesFeesSchema.plugin(AutoIncrement, { inc_field: 'categories_fees_id' });

module.exports = mongoose.model('CategoriesFees', categoriesFeesSchema);

