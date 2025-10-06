const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const eventDiscussionChatSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  event_id: {
    type: Number,
    ref: 'Event',
    required: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  message_type: {
    type: String,
    enum: ['text', 'image', 'file', 'link'],
    default: 'text'
  },
  file_url: {
    type: String,
    trim: true
  },
  reply_to: {
    type: Number,
    ref: 'EventDiscussionChat',
    default: null
  },
  is_edited: {
    type: Boolean,
    default: false
  },
  edited_at: {
    type: Date,
    default: null
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
    ref: 'User',
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

eventDiscussionChatSchema.plugin(AutoIncrement, { inc_field: 'id' });

module.exports = mongoose.model('EventDiscussionChat', eventDiscussionChatSchema);
