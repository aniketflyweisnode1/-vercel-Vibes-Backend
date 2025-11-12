const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const vendorBookingSchema = new mongoose.Schema({
  Vendor_Booking_id: {
    type: Number,
    unique: true
  },
  Year: {
    type: Number,
    required: [true, 'Year is required']
  },
  Month: {
    type: Number,
    required: [true, 'Month is required'],
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12']
  },
  Date_start: {
    type: Date,
    required: [true, 'Start date is required']
  },
  End_date: {
    type: Date,
    default: null
  },
  User_availabil: {
    type: String,
    enum: ['Book', 'leave'],
    default: 'Book'
  },
  Start_time: {
    type: String,
    trim: true,
    default: null
  },
  End_time: {
    type: String,
    trim: true,
    default: null
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  vendor_id: {
    type: Number,
    ref: 'User',
    default: null
  },
  Vendor_Category_id: {
    type: [Number],
    ref: 'Category',
    default: []
  },
  amount: {
    type: Number,
    default: 0
  },
  amount_status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'rescheduled',"fullpayment"],
    default: 'pending'
  },
  vendor_amount: {  
    type: Number,
    default: 0
  },
  vendor_amount_status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'rescheduled', 'fullpayment'],
    default: 'pending'
  },
  Event_id: {
    type: Number,
    ref: 'Event',
    default: null
  },
  vender_booking_status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
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
  timestamps: false,
  versionKey: false
});

vendorBookingSchema.plugin(AutoIncrement, { inc_field: 'Vendor_Booking_id' });

module.exports = mongoose.model('Vendor_Booking', vendorBookingSchema);

