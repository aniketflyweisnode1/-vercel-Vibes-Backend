const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const leadDiscoveredSchema = new mongoose.Schema({
  Lead_Discovered_id: {
    type: Number,
    unique: true
  },
  Vendor_Leads_id: {
    type: Number,
    ref: 'Vendor_Leads',
    required: [true, 'Vendor Leads ID is required']
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  covert: {
    type: Boolean,
    default: false
  },
  Status: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Number,
    ref: 'User',
    required: true
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

leadDiscoveredSchema.plugin(AutoIncrement, { inc_field: 'Lead_Discovered_id' });

module.exports = mongoose.model('Lead_Discovered', leadDiscoveredSchema);
