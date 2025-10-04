const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const vibesCardStudioSchema = new mongoose.Schema({
  vibescard_studio_id: {
    type: Number,
    unique: true
  },
  event_id: {
    type: Number,
    ref: 'Event',
    required: true
  },
  category_id: {
    type: Number,
    ref: 'EventCategoryTags',
    required: true
  },
  templates: {
    type: String,
    trim: true
  },
  colorScheme: {
    type: String,
    trim: true
  },
  canvas_size: {
    type: String,
    trim: true
  },
  zoomlevel: {
    type: Number,
    default: 100,
    min: 10,
    max: 500
  },
  status: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Number,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Number,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});
vibesCardStudioSchema.plugin(AutoIncrement, { inc_field: 'vibescard_studio_id' });


  

module.exports = mongoose.model('VibesCardStudio', vibesCardStudioSchema);
