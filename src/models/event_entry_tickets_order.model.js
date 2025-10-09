const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const eventEntryTicketsOrderSchema = new mongoose.Schema({
  event_entry_tickets_order_id: {
    type: Number,
    unique: true
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
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  coupon_code_id: {
    type: Number,
    ref: 'CouponCode',
    default: null
  },
  discount_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  final_amount: {
    type: Number,
    required: true,
    min: 0
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

eventEntryTicketsOrderSchema.plugin(AutoIncrement, { inc_field: 'event_entry_tickets_order_id' });

module.exports = mongoose.model('EventEntryTicketsOrder', eventEntryTicketsOrderSchema);

