const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const serviceItemsSchema = new mongoose.Schema({
  service_items_id: {
    type: Number,
    unique: true
  },
  vendor_service_type_id: {
    type: Number,
    ref: 'VendorServiceType',
    required: [true, 'Vendor Service Type ID is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  item_image: {
    type: String,
    trim: true,
    maxlength: [500, 'Item image URL cannot exceed 500 characters']
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

serviceItemsSchema.plugin(AutoIncrement, { inc_field: 'service_items_id' });

module.exports = mongoose.model('ServiceItems', serviceItemsSchema);
