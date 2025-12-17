const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorLeadsSchema = new mongoose.Schema({
  Vendor_Leads_id: {
    type: Number,
    unique: true
  },
  Vendor_name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
    maxlength: [200, 'Vendor name cannot exceed 200 characters']
  },
  platform: {
    type: String,
    required: [true, 'Platform is required'],
    trim: true,
    maxlength: [100, 'Platform cannot exceed 100 characters']
  },
  shop_Profile_url: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL starting with http:// or https://']
  },
  product_serviceType: {
    type: String,
    required: [true, 'Product/Service type is required'],
    trim: true,
    maxlength: [200, 'Product/Service type cannot exceed 200 characters']
  },
  ContactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email']
  },
  ContactPhone: {
    type: String,
    trim: true,
    // match: [/^[0-9+\-\s()]{10,15}$/, 'Please enter a valid phone number']
  },
  DiscoverySource: {
    type: String,
    required: [true, 'Discovery source is required'],
    trim: true,
    maxlength: [100, 'Discovery source cannot exceed 100 characters']
  },
  ContactMobile: {
    type: String,
    required: [true, 'Contact mobile is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  EstimetedValuePrice: {
    type: Number,
    required: [true, 'Estimated value price is required'],
    min: [0, 'Estimated value price cannot be negative']
  },
  Tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  Notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  LeadStatus: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
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

vendorLeadsSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Leads_id' });

module.exports = mongoose.model('Vendor_Leads', vendorLeadsSchema);
