const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const messagesSchema = new mongoose.Schema({
  messages_id: {
    type: Number,
    unique: true
  },
  sender_id: {
    type: Number,
    ref: 'User',
    required: [true, 'Sender ID is required']
  },
  receiver_id: {
    type: Number,
    ref: 'User',
    required: [true, 'Receiver ID is required']
  },
  messages_txt: {
    type: String,
    required: [true, 'Messages text is required'],
    trim: true,
    maxlength: [1000, 'Messages text cannot exceed 1000 characters']
  },
  image: {
    type: String,
    trim: true,
    maxlength: [500, 'Image path cannot exceed 500 characters']
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
    default: null
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

// Add auto-increment plugin
messagesSchema.plugin(AutoIncrement, { inc_field: 'messages_id' });

// Index for better performance
messagesSchema.index({ messages_id: 1 });
messagesSchema.index({ messages_txt: 1 });
messagesSchema.index({ status: 1 });
messagesSchema.index({ created_at: -1 });

module.exports = mongoose.model('Messages', messagesSchema);
