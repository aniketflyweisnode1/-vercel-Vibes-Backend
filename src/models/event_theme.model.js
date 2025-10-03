const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const eventThemeSchema = new mongoose.Schema({
  event_theme_id: {
    type: Number,
    unique: true
  },
  event_theme_name: {
    type: String,
    required: [true, 'Event Theme name is required'],
    trim: true,
    maxlength: [200, 'Event Theme name cannot exceed 200 characters']
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

eventThemeSchema.plugin(AutoIncrement, { inc_field: 'event_theme_id' });

module.exports = mongoose.model('EventTheme', eventThemeSchema);

