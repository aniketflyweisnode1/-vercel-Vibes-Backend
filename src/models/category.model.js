const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const categorySchema = new mongoose.Schema({
  category_id: {
    type: Number,
    unique: true
  },
  category_name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [200, 'Category name cannot exceed 200 characters']
  },
  emozi: {
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
  timestamps: false,
  versionKey: false
});

categorySchema.plugin(AutoIncrement, { inc_field: 'category_id' });

module.exports = mongoose.model('Category', categorySchema);

