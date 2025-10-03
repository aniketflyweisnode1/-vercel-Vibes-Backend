const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ticketTypeSchema = new mongoose.Schema({
  ticket_type_id: {
    type: Number,
    unique: true
  },
  ticket_type: {
    type: String,
    required: [true, 'Ticket type is required'],
    trim: true,
    maxlength: [100, 'Ticket type cannot exceed 100 characters']
  },
  emoji: {
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
ticketTypeSchema.plugin(AutoIncrement, { inc_field: 'ticket_type_id' });

// Index for better performance
ticketTypeSchema.index({ ticket_type_id: 1 });
ticketTypeSchema.index({ ticket_type: 1 });
ticketTypeSchema.index({ status: 1 });

module.exports = mongoose.model('TicketType', ticketTypeSchema);
