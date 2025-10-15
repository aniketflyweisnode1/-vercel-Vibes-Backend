const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const designTabsMapSchema = new mongoose.Schema({
  design_tabs_map_id: {
    type: Number,
    unique: true
  },
  tabs_id: {
    type: Number,
    ref: 'DesignCommunityTabs',
    required: [true, 'Tabs ID is required']
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
  },
  design_json_data: {
    type: String,
    trim: true
  },
  collaborators_user_id: [{
    id: {
      type: Number,
      ref: 'User',
      required: true
    },
    permission: {
      type: String,
      required: true,
      default: 'View'
    }
  }]
}, {
  timestamps: false,
  versionKey: false
});

designTabsMapSchema.plugin(AutoIncrement, { inc_field: 'design_tabs_map_id' });

module.exports = mongoose.model('DesignTabsMap', designTabsMapSchema);

