const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vibeFundCampaignSchema = new mongoose.Schema({
  vibe_fund_campaign_id: {
    type: Number,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  campaign_description: {
    type: String,
    required: [true, 'Campaign description is required'],
    trim: true,
    maxlength: [2000, 'Campaign description cannot exceed 2000 characters']
  },
  campaign_story: {
    type: String,
    trim: true,
    maxlength: [5000, 'Campaign story cannot exceed 5000 characters']
  },
  business_category_id: {
    type: Number,
    ref: 'BusinessCategory',
    required: [true, 'Business category ID is required']
  },
  compaign_type_id: {
    type: Number,
    ref: 'CompaignType',
    required: [true, 'Compaign type ID is required']
  },
  funding_goal: {
    type: Number,
    required: [true, 'Funding goal is required'],
    min: [0, 'Funding goal must be a positive number']
  },
  campaign_duration: {
    type: String,
    trim: true,
    maxlength: [100, 'Campaign duration cannot exceed 100 characters']
  },
  funding_model: {
    type: String,
    trim: true,
    maxlength: [200, 'Funding model cannot exceed 200 characters']
  },
  cover_image: {
    type: String,
    trim: true
  },
  campaign_video: {
    type: String,
    trim: true
  },
  reward_tiers: {
    type: [String],
    default: []
  },
  milestones: {
    type: [String],
    default: []
  },
  approved_status: {
    type: Boolean,
    default: false
  },
  emozi: {
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
  timestamps: false,
  versionKey: false
});

vibeFundCampaignSchema.plugin(AutoIncrement, { inc_field: 'vibe_fund_campaign_id' });

module.exports = mongoose.model('VibeFundCampaign', vibeFundCampaignSchema);

