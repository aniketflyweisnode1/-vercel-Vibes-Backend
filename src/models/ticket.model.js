const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ticketSchema = new mongoose.Schema({
  ticket_id: {
    type: Number,
    unique: true
  },
  event_id: {
    type: Number,
    ref: 'Event',
  },
  max_capacity: {
    type: Number,
    min: [1, 'Max capacity must be at least 1']
  },
  ticketDateils: [{
    ticket_type_id: {
      type: Number,
      ref: 'TicketType',
      required: [true, 'Ticket type ID is required']
    },
    ticket_query: {
      type: String,
      trim: true,
      maxlength: [2000, 'Ticket query cannot exceed 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    }
  }],
  reply: {
    type: String,
    trim: true,
    maxlength: [2000, 'Reply cannot exceed 2000 characters'],
    default: ''
  },
  status: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Number,
    ref: 'User',
    default: null
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
  timestamps: false, // We're using custom timestamp fields
  versionKey: false
});

// Add auto-increment plugin
ticketSchema.plugin(AutoIncrement, { inc_field: 'ticket_id' });

// Index for better performance
ticketSchema.index({ ticket_id: 1 });
ticketSchema.index({ 'ticketDateils.ticket_type_id': 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ created_at: -1 });
ticketSchema.index({ 'ticketDateils.ticket_query': 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
