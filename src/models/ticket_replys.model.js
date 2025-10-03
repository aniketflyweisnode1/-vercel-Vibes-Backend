const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ticketReplysSchema = new mongoose.Schema({
  ticket_replys_id: {
    type: Number,
    unique: true
  },
  ticket_id: {
    type: Number,
    ref: 'Ticket',
    required: [true, 'Ticket ID is required']
  },
  reply: {
    type: String,
    required: [true, 'Reply is required'],
    trim: true,
    maxlength: [2000, 'Reply cannot exceed 2000 characters']
  },
  reply_by_id: {
    type: Number,
    ref: 'User',
    required: [true, 'Reply by ID is required']
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
ticketReplysSchema.plugin(AutoIncrement, { inc_field: 'ticket_replys_id' });

// Index for better performance
ticketReplysSchema.index({ ticket_replys_id: 1 });
ticketReplysSchema.index({ ticket_id: 1 });
ticketReplysSchema.index({ reply_by_id: 1 });
ticketReplysSchema.index({ status: 1 });
ticketReplysSchema.index({ created_at: -1 });

module.exports = mongoose.model('TicketReplys', ticketReplysSchema);
