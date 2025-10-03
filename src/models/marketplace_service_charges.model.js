const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const marketplaceServiceChargesSchema = new mongoose.Schema({
  service_charges_id: {
    type: Number,
    unique: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  service_name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [200, 'Service name cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  rateing: {
    type: Number,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0
  },
  emozi: {
    type: String,
    trim: true,
    maxlength: [10, 'Emoji cannot exceed 10 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [500, 'Location cannot exceed 500 characters']
  },
  category_id: {
    type: Number,
    ref: 'Category'
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

marketplaceServiceChargesSchema.plugin(AutoIncrement, { inc_field: 'service_charges_id' });

module.exports = mongoose.model('MarketPlaceServiceCharges', marketplaceServiceChargesSchema);

