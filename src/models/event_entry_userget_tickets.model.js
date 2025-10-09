const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const eventEntryUsergetTicketsSchema = new mongoose.Schema({
  event_entry_userget_tickets_id: {
    type: Number,
    unique: true
  },
  event_id: {
    type: Number,
    ref: 'Event',
    required: true
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

eventEntryUsergetTicketsSchema.plugin(AutoIncrement, { inc_field: 'event_entry_userget_tickets_id' });

module.exports = mongoose.model('EventEntryUsergetTickets', eventEntryUsergetTicketsSchema);

