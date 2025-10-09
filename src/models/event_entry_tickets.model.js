const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const eventEntryTicketsSchema = new mongoose.Schema({
  event_entry_tickets_id: {
    type: Number,
    unique: true
  },
  event_id: {
    type: Number,
    ref: 'Event',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  total_seats: {
    type: Number,
    required: true,
    min: 1
  },
  facility: [{
    type: mongoose.Schema.Types.Mixed
  }],
  tag: {
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

eventEntryTicketsSchema.plugin(AutoIncrement, { inc_field: 'event_entry_tickets_id' });

module.exports = mongoose.model('EventEntryTickets', eventEntryTicketsSchema);

