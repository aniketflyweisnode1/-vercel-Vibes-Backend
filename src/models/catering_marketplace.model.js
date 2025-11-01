const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const cateringMarketplaceSchema = new mongoose.Schema({
  catering_marketplace_id: {
    type: Number,
    unique: true
  },
  catering_marketplace_category_id: {
    type: Number,
    ref: 'CateringMarketplaceCategory',
    required: [true, 'Catering Marketplace Category ID is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  image: {
    type: String,
    trim: true,
    maxlength: [500, 'Image URL cannot exceed 500 characters']
  },
  review_count: {
    type: Number,
    default: 0,
    min: [0, 'Review Count cannot be negative']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  mobile_no: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  amount_per_guest: {
    type: Number,
    default: 0,
    min: [0, 'Amount per guest cannot be negative']
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

cateringMarketplaceSchema.plugin(AutoIncrement, { inc_field: 'catering_marketplace_id' });

module.exports = mongoose.model('CateringMarketplace', cateringMarketplaceSchema);
