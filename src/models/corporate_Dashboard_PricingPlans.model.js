const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const corporateDashboardPricingPlansSchema = new mongoose.Schema({
  PricingPlans_id: {
    type: Number,
    unique: true
  },
  MinBookingFee: {
    type: Number,
    required: [true, 'Minimum booking fee is required'],
    min: [0, 'Minimum booking fee cannot be negative']
  },
  PriceRangeMin: {
    type: Number,
    required: [true, 'Price range minimum is required'],
    min: [0, 'Price range minimum cannot be negative']
  },
  PriceRangeMax: {
    type: Number,
    required: [true, 'Price range maximum is required'],
    min: [0, 'Price range maximum cannot be negative']
  },
  isDeposit: {
    type: Boolean,
    default: false
  },
  PaymentMethods: [{
    type: Number,
    ref: 'PaymentMethods',
    required: [true, 'Payment methods are required']
  }],
  Status: {
    type: Boolean,
    default: true
  },
  CreateBy: {
    type: Number,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  CreateAt: {
    type: Date,
    default: Date.now
  },
  UpdatedBy: {
    type: Number,
    ref: 'User',
    default: null
  },
  UpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false, // We're using custom timestamp fields
  versionKey: false
});

corporateDashboardPricingPlansSchema.plugin(AutoIncrement, { inc_field: 'PricingPlans_id' });

// Custom validation to ensure PriceRangeMax is greater than PriceRangeMin
corporateDashboardPricingPlansSchema.pre('save', function(next) {
  if (this.PriceRangeMax <= this.PriceRangeMin) {
    next(new Error('Price range maximum must be greater than price range minimum'));
  } else {
    next();
  }
});

module.exports = mongoose.model('CorporateDashboardPricingPlans', corporateDashboardPricingPlansSchema);
