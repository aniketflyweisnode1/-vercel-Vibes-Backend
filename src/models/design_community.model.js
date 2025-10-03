const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const designCommunitySchema = new mongoose.Schema({
  design_community_id: {
    type: Number,
    unique: true
  },
  event_id: {
    type: Number,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  invited_user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'Invited User ID is required']
  },
  approval: {
    type: String,
    enum: ['Accept', 'Decline'],
    default: null
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
  timestamps: false, // We're using custom timestamp fields
  versionKey: false
});

designCommunitySchema.plugin(AutoIncrement, { inc_field: 'design_community_id' });

module.exports = mongoose.model('DesignCommunity', designCommunitySchema);
