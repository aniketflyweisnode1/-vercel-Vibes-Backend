const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const filterVendorLeadsSchema = new mongoose.Schema({
  filter_vendor_leads_id: {
    type: Number,
    unique: true
  },
  vendor_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  vendor_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  platform: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  shop_url: {
    type: String,
    trim: true,
    maxlength: 500
  },
  product_service_type: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  contact_email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 255
  },
  contact_phone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  discovery_source: {
    type: String,
    trim: true,
    maxlength: 255
  },
  contact_phone_alt: {
    type: String,
    trim: true,
    maxlength: 20
  },
  estimated_value: {
    type: Number,
    min: 0,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  emozi: {
    type: String,
    trim: true,
    maxlength: 10
  },
  status: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Number,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Number,
    ref: 'User',
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

filterVendorLeadsSchema.plugin(AutoIncrement, { inc_field: 'filter_vendor_leads_id' });

module.exports = mongoose.model('FilterVendorLeads', filterVendorLeadsSchema);
