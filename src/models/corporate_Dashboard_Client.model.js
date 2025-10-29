const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const corporateDashboardClientSchema = new mongoose.Schema({
  Client_id: {
    type: Number,
    unique: true
  },
  CompanyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
    maxlength: [100, 'Industry cannot exceed 100 characters']
  },
  EmployeeCount: {
    type: Number,
    required: [true, 'Employee count is required'],
    min: [1, 'Employee count must be at least 1']
  },
  ContactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  Plan_id: {
    type: Number,
    ref: 'CorporateDashboardPricingPlans',
    required: [true, 'Plan ID is required']
  },
  Status: {
    type: Boolean,
    default: true
  },
  CreateBy: {
    type: Number,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  CreateAt: {
    type: Date,
    default: Date.now
  },
  UpdatedBy: {
    type: Number,
    ref: 'User',
    default: null
  },
  UpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false, // We're using custom timestamp fields
  versionKey: false
});

corporateDashboardClientSchema.plugin(AutoIncrement, { inc_field: 'Client_id' });

module.exports = mongoose.model('CorporateDashboardClient', corporateDashboardClientSchema);
