const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const featuredSchema = new mongoose.Schema({
  Featured_id: {
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

featuredSchema.plugin(AutoIncrement, { inc_field: 'Featured_id' });

module.exports = mongoose.model('Featured', featuredSchema);
