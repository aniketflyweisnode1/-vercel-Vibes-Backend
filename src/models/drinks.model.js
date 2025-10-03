const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const drinksSchema = new mongoose.Schema({
  drinks_id: {
    type: Number,
    unique: true
  },
  drinks_name: {
    type: String,
    required: [true, 'Drinks name is required'],
    trim: true,
    maxlength: [200, 'Drinks name cannot exceed 200 characters']
  },
  drinks_price: {
    type: Number,
    required: [true, 'Drinks price is required'],
    min: [0, 'Drinks price must be a positive number']
  },
  drinks_color: {
    type: String,
    trim: true,
    maxlength: [50, 'Drinks color cannot exceed 50 characters']
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

drinksSchema.plugin(AutoIncrement, { inc_field: 'drinks_id' });

module.exports = mongoose.model('Drinks', drinksSchema);

