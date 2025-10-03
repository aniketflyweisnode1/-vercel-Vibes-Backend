const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const marketplaceBookingSchema = new mongoose.Schema({
  marketplace_booking_id: {
    type: Number,
    unique: true
  },
  marketplace_service_charges_id: {
    type: Number,
    ref: 'MarketPlaceServiceCharges',
    required: [true, 'MarketPlace Service Charges ID is required']
  },
  event_start_date: {
    type: Date,
    required: [true, 'Event start date is required']
  },
  event_end_date: {
    type: Date,
    required: [true, 'Event end date is required']
  },
  event_start_time: {
    type: String,
    required: [true, 'Event start time is required'],
    trim: true
  },
  event_end_time: {
    type: String,
    required: [true, 'Event end time is required'],
    trim: true
  },
  event_name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [200, 'Event name cannot exceed 200 characters']
  },
  event_address: {
    type: String,
    required: [true, 'Event address is required'],
    trim: true,
    maxlength: [500, 'Event address cannot exceed 500 characters']
  },
  event_type_id: {
    type: Number,
    ref: 'EventType',
    required: [true, 'Event type ID is required']
  },
  no_of_guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'Number of guests must be at least 1']
  },
  event_img: {
    type: String,
    trim: true
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

marketplaceBookingSchema.plugin(AutoIncrement, { inc_field: 'marketplace_booking_id' });

module.exports = mongoose.model('MarketPlaceBooking', marketplaceBookingSchema);

