const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const decorationsSchema = new mongoose.Schema({
  decorations_id: {
    type: Number,
    unique: true
  },
  decorations_name: {
    type: String,
    required: [true, 'Decorations name is required'],
    trim: true,
    maxlength: [200, 'Decorations name cannot exceed 200 characters']
  },
  decorations_price: {
    type: Number,
    required: [true, 'Decorations price is required'],
    min: [0, 'Decorations price must be a positive number']
  },
  decorations_type: {
    type: String,
    trim: true,
    maxlength: [100, 'Decorations type cannot exceed 100 characters']
  },
  brand_name: {
    type: String,
    trim: true,
    maxlength: [200, 'Brand name cannot exceed 200 characters']
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
  timestamps: false,
  versionKey: false
});

decorationsSchema.plugin(AutoIncrement, { inc_field: 'decorations_id' });

module.exports = mongoose.model('Decorations', decorationsSchema);

