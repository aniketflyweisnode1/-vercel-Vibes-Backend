const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const eventTicketsSeatsSchema = new mongoose.Schema({
  event_tickets_seats_id: {
    type: Number,
    unique: true
  },
  event_id: {
    type: Number,
    ref: 'Event',
    required: true
  },
  tax_percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  coupon_code: {
    type: String,
    trim: true
  },
  promo_code: {
    type: String,
    trim: true
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
  loyalty_points: {
    type: Boolean,
    default: false
  },
  tickets: [{
    event_entry_tickets_id: {
      type: Number,
      ref: 'EventEntryTickets',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
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

