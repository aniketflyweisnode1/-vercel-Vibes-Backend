const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const contactVendorSchema = new mongoose.Schema({
  contact_vendor_id: {
    type: Number,
    unique: true
  },
  vendor_id: {
    type: Number,
    ref: 'User',
    required: [true, 'Vendor ID is required']
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  event_id: {
    type: Number,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
    maxlength: [200, 'Topic cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Number,
    ref: 'User',
    required: [true, 'Created by is required']
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
  timestamps: false, // We're using custom timestamp fields
  versionKey: false
});

contactVendorSchema.plugin(AutoIncrement, { inc_field: 'contact_vendor_id' });

module.exports = mongoose.model('ContactVendor', contactVendorSchema);

