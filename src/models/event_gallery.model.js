const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const eventGallerySchema = new mongoose.Schema({
  event_gallery_id: {
    type: Number,
    unique: true
  },
  event_gallery_name: {
    type: String,
    required: [true, 'Event Gallery name is required'],
    trim: true,
    maxlength: [200, 'Event Gallery name cannot exceed 200 characters']
  },
  event_gallery_photo: [{
    name: {
      type: String,
      trim: true,
      maxlength: [200, 'Photo name cannot exceed 200 characters']
    },
    photo: {
      type: String,
      trim: true
    }
  }],
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

eventGallerySchema.plugin(AutoIncrement, { inc_field: 'event_gallery_id' });

module.exports = mongoose.model('EventGallery', eventGallerySchema);

