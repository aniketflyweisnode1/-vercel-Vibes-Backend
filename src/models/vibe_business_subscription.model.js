const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const vibeBusinessSubscriptionSchema = new mongoose.Schema({
  plan_id: {
    type: Number,
    unique: true,
  },
  planDuration: {
    type: String,
    enum: ['Monthly', 'Annually'],
    default: 'Monthly'
  },
  plan_name: {
    type: String,
    
    trim: true,
    maxlength: [100, 'Plan name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  line_one: {
    type: String,
    trim: true,
    maxlength: [200, 'Line one cannot exceed 200 characters']
  },
  line_two: {
    type: String,
    trim: true,
    maxlength: [200, 'Line two cannot exceed 200 characters']
  },
  line_three: {
    type: String,
    trim: true,
    maxlength: [200, 'Line three cannot exceed 200 characters']
  },
  line_four: {
    type: String,
    trim: true,
    maxlength: [200, 'Line four cannot exceed 200 characters']
  },
  line_five: {
    type: String,
    trim: true,
    maxlength: [200, 'Line five cannot exceed 200 characters']
  },
  line_six: {
    type: String,
    trim: true,
    maxlength: [200, 'Line six cannot exceed 200 characters']
  },
  status: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Number,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Number,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

vibeBusinessSubscriptionSchema.plugin(AutoIncrement, { inc_field: 'plan_id' });

module.exports = mongoose.model('VibeBusinessSubscription', vibeBusinessSubscriptionSchema);
