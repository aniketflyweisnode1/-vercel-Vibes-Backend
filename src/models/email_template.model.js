const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const emailTemplateSchema = new mongoose.Schema({
  EmailTemplate_id: {
    type: Number,
    unique: true
  },
  vendor_id: {
    type: Number,
    ref: 'User',
    required: [true, 'Vendor ID is required']
  },
  Title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  subTitle: {
    type: String,
    trim: true,
    maxlength: [300, 'Subtitle cannot exceed 300 characters']
  },
  Subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  Preview: {
    type: String,
    trim: true,
    maxlength: [1000, 'Preview cannot exceed 1000 characters']
  },
  defultTemplate: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL starting with http:// or https://']
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

emailTemplateSchema.plugin(AutoIncrement, { inc_field: 'EmailTemplate_id' });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
