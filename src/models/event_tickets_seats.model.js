const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const EventEntryTickets = require('./event_entry_tickets.model');

const eventTicketsSeatsSchema = new mongoose.Schema({
  event_tickets_seats_id: {
    type: Number,
    unique: true
  },
  event_entry_tickets_id: {
    type: [Number],
    ref: 'EventEntryTickets',
    required: true,
    default: []
  },
  event_entry_userget_tickets_id: {
    type: Number,
    ref: 'EventEntryUsergetTickets',
    required: true
  },
  event_id: {
    type: Number,
    ref: 'Event',
    required: true
  },
  seat_no: {
    type: [String],
    default: []
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phoneNo: {
    type: String,
    trim: true
  },
  promo_code: {
    type: String,
    trim: true
  },
  loyalty_points: {
    type: Boolean,
    default: false
  },
  capacity: {
    type: Number,
    min: 1
  },
  type: {
    type: String,
    trim: true
  },
  map: {
    type: String,
    trim: true
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
    ref: 'User',
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

eventTicketsSeatsSchema.plugin(AutoIncrement, { inc_field: 'event_tickets_seats_id' });

module.exports = mongoose.model('EventTicketsSeats', eventTicketsSeatsSchema);

