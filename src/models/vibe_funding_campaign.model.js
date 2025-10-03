const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vibeFundingCampaignSchema = new mongoose.Schema({
  vibe_funding_campaign_id: {
    type: Number,
    unique: true
  },
  vibe_fund_campaign_id: {
    type: Number,
    ref: 'VibeFundCampaign',
    required: [true, 'Vibe Fund Campaign ID is required']
  },
  fund_amount: {
    type: Number,
    required: [true, 'Fund amount is required'],
    min: [0, 'Fund amount must be a positive number']
  },
  fundby_user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'Fund by user ID is required']
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

vibeFundingCampaignSchema.plugin(AutoIncrement, { inc_field: 'vibe_funding_campaign_id' });

module.exports = mongoose.model('VibeFundingCampaign', vibeFundingCampaignSchema);

