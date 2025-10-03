const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const notificationSchema = new mongoose.Schema({
  notification_id: {
    type: Number,
    unique: true
  },
  notification_type_id: {
    type: Number,
    ref: 'NotificationType',
    required: [true, 'Notification type ID is required']
  },
  notification_txt: {
    type: String,
    required: [true, 'Notification text is required'],
    trim: true,
    maxlength: [500, 'Notification text cannot exceed 500 characters']
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  is_read: {
    type: Boolean,
    default: false
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
notificationSchema.plugin(AutoIncrement, { inc_field: 'notification_id' });

// Index for better performance
notificationSchema.index({ notification_id: 1 });
notificationSchema.index({ user_id: 1 });
notificationSchema.index({ notification_type_id: 1 });
notificationSchema.index({ is_read: 1 });
notificationSchema.index({ created_at: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
