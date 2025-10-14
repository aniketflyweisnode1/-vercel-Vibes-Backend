const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const communityDesignsDownloadsSchema = new mongoose.Schema({
  community_designs_downloads_id: {
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

communityDesignsDownloadsSchema.plugin(AutoIncrement, { inc_field: 'community_designs_downloads_id' });

module.exports = mongoose.model('CommunityDesignsDownloads', communityDesignsDownloadsSchema);

