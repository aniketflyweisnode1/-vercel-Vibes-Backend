const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const cateringMarketplaceBookingSchema = new mongoose.Schema({
  catering_marketplace_booking_id: {
    type: Number,
    unique: true
  },
  catering_marketplace_id: {
    type: Number,
    ref: 'CateringMarketplace',
    required: [true, 'Catering Marketplace ID is required']
  },
  event_id: {
    type: Number,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  event_to_date: {
    type: Date,
    required: [true, 'Event To Date is required']
  },
  event_from_date: {
    type: Date,
    required: [true, 'Event From Date is required']
  },
  event_to_time: {
    type: String,
    required: [true, 'Event To Time is required'],
    trim: true
  },
  event_from_time: {
    type: String,
    required: [true, 'Event From Time is required'],
    trim: true
  },
  guest_count: {
    type: Number,
    required: [true, 'Guest Count is required'],
    min: [1, 'Guest Count must be at least 1']
  },
  transaction_id: {
    type: Number,
    ref: 'Transaction',
    default: null
  },
  transaction_status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
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

cateringMarketplaceBookingSchema.plugin(AutoIncrement, { inc_field: 'catering_marketplace_booking_id' });

module.exports = mongoose.model('CateringMarketplaceBooking', cateringMarketplaceBookingSchema);
