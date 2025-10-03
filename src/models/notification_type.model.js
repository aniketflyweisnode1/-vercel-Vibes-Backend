const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const notificationTypeSchema = new mongoose.Schema({
  notification_type_id: {
    type: Number,
    unique: true
  },
  notification_type: {
    type: String,
    required: [true, 'Notification type is required'],
    trim: true,
    maxlength: [100, 'Notification type cannot exceed 100 characters']
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
notificationTypeSchema.plugin(AutoIncrement, { inc_field: 'notification_type_id' });

// Index for better performance
notificationTypeSchema.index({ notification_type_id: 1 });
notificationTypeSchema.index({ notification_type: 1 });

module.exports = mongoose.model('NotificationType', notificationTypeSchema);
