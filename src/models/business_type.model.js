const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const businessTypeSchema = new mongoose.Schema({
  business_type_id: {
    type: Number,
    unique: true
  },
  business_type: {
    type: String,
    required: [true, 'Business type is required'],
    trim: true,
    maxlength: [100, 'Business type cannot exceed 100 characters']
  },
  emoji: {
    type: String,
    trim: true,
    maxlength: [10, 'Emoji cannot exceed 10 characters']
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

businessTypeSchema.plugin(AutoIncrement, { inc_field: 'business_type_id' });

module.exports = mongoose.model('BusinessType', businessTypeSchema);
