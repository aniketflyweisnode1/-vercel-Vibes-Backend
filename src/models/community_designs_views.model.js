const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const communityDesignsViewsSchema = new mongoose.Schema({
  community_designs_views_id: {
    type: Number,
    unique: true
  },
  community_designs_id: {
    type: Number,
    ref: 'CommunityDesigns',
    required: [true, 'Community Designs ID is required']
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

communityDesignsViewsSchema.plugin(AutoIncrement, { inc_field: 'community_designs_views_id' });

module.exports = mongoose.model('CommunityDesignsViews', communityDesignsViewsSchema);

