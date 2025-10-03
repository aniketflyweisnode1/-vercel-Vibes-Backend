const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorMapServiceTypeSchema = new mongoose.Schema({
  vendor_map_service_id: {
    type: Number,
    unique: true
  },
  vendor_service_type_id: {
    type: Number,
    ref: 'VendorServiceType',
    required: [true, 'Vendor Service Type ID is required']
  },
  vendor_id: {
    type: Number,
    ref: 'User',
    required: [true, 'Vendor ID is required']
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

vendorMapServiceTypeSchema.plugin(AutoIncrement, { inc_field: 'vendor_map_service_id' });

module.exports = mongoose.model('VendorMapServiceType', vendorMapServiceTypeSchema);
