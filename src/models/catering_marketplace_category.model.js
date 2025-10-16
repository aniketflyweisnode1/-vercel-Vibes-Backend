const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const cateringMarketplaceCategorySchema = new mongoose.Schema({
  catering_marketplace_category_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  dish: {
    type: String,
    required: [true, 'Dish is required'],
    trim: true,
    maxlength: [200, 'Dish cannot exceed 200 characters']
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

cateringMarketplaceCategorySchema.plugin(AutoIncrement, { inc_field: 'catering_marketplace_category_id' });

module.exports = mongoose.model('CateringMarketplaceCategory', cateringMarketplaceCategorySchema);
