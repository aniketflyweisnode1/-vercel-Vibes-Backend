const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const categoriesFeesSchema = new mongoose.Schema({
  categories_fees_id: {
    type: Number,
    unique: true
  },
  category_id: {
    type: Number,
    ref: 'Category',
    required: [true, 'Category ID is required']
  },
  pricing_currency: {
    type: String,
    trim: true,
    maxlength: [10, 'Currency code cannot exceed 10 characters'],
    default: 'USD'
  },
  PlatformFee: {
    type: Number,
    default: 10,
    //required: [true, 'Platform fee is required'],
    min: [0, 'Platform fee must be a positive number']
  },
  Price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
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

