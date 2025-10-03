const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const shareEventSchema = new mongoose.Schema({
  share_event_id: {
    type: Number,
    unique: true
  },
  event_id: {
    type: Number,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  share_user_to: {
    type: Number,
    ref: 'User',
    required: [true, 'Share user to is required']
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

shareEventSchema.plugin(AutoIncrement, { inc_field: 'share_event_id' });

module.exports = mongoose.model('ShareEvent', shareEventSchema);

