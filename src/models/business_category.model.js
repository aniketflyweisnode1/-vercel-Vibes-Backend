const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const businessCategorySchema = new mongoose.Schema({
  business_category_id: {
    type: Number,
    unique: true
  },
  business_category: {
    type: String,
    required: [true, 'Business category is required'],
    trim: true,
    maxlength: [100, 'Business category cannot exceed 100 characters']
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

businessCategorySchema.plugin(AutoIncrement, { inc_field: 'business_category_id' });

module.exports = mongoose.model('BusinessCategory', businessCategorySchema);
