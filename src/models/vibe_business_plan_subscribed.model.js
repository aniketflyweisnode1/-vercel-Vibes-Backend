const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const vibeBusinessPlanSubscribedSchema = new mongoose.Schema({
  vibe_business_plan_subscribed_id: {
    type: Number,
    unique: true
  },
  user_id: {
    type: Number,
    ref: 'User',
   
  },
  plan_id: {
    type: Number,
    ref: 'VibeBusinessSubscription',
   
  },
  transaction_id: {
    type: Number,
    ref: 'Transaction',
    default: null
  },
  transaction_status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  start_plan_date: {
    type: Date,
    default: null
  },
  end_plan_date: {
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

  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Number,
    ref: 'User',
      
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});


vibeBusinessPlanSubscribedSchema.plugin(AutoIncrement, { inc_field: 'vibe_business_plan_subscribed_id' });

module.exports = mongoose.model('VibeBusinessPlanSubscribed', vibeBusinessPlanSubscribedSchema);
