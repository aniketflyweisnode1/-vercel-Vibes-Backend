const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorCorporateClientSchema = new mongoose.Schema({
  vendor_corporate_client_id: {
    type: Number,
    unique: true
  },
  vendor_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  company_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  industry: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  employee_count: {
    type: Number,
    required: true,
    min: 1
  },
  contact_email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 255
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
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

vendorCorporateClientSchema.plugin(AutoIncrement, { inc_field: 'vendor_corporate_client_id' });

module.exports = mongoose.model('VendorCorporateClient', vendorCorporateClientSchema);
