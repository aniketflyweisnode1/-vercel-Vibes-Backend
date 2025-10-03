const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const dressCodeSchema = new mongoose.Schema({
  dress_code_id: {
    type: Number,
    unique: true
  },
  dress_code_name: {
    type: String,
    required: [true, 'Dress Code name is required'],
    trim: true,
    maxlength: [200, 'Dress Code name cannot exceed 200 characters']
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

dressCodeSchema.plugin(AutoIncrement, { inc_field: 'dress_code_id' });

module.exports = mongoose.model('DressCode', dressCodeSchema);

