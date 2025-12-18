const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const staffEventBookSchema = new mongoose.Schema({
  staff_event_book_id: {
    type: Number,
    unique: true
  },
  event_id: {
    type: Number,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  dateTo: {
    type: Date,
    required: [true, 'Date To is required']
  },
  dateFrom: {
    type: Date,
    required: [true, 'Date From is required']
  },
  timeTo: {
    type: String,
    required: [true, 'Time To is required'],
    trim: true
  },
  timeFrom: {
    type: String,
    required: [true, 'Time From is required'],
    trim: true
  },
  event_type_id: {
    type: Number,
    ref: 'EventType',
    required: [true, 'Event Type ID is required']
  },
  staff_id: {
    type: Number,
    ref: 'User',
    required: [true, 'Staff ID is required']
  },
  event_name: {
    type: String,
    required: [true, 'Event Name is required'],
    trim: true,
    maxlength: [200, 'Event Name cannot exceed 200 characters']
  },
  event_address: {
    type: String,
    required: [true, 'Event Address is required'],
    trim: true,
    maxlength: [500, 'Event Address cannot exceed 500 characters']
  },
  no_of_guests: {
    type: Number,
    required: [true, 'Number of Guests is required'],
    min: [1, 'Number of Guests must be at least 1']
  },
  special_instruction: {
    type: String,
    trim: true,
    maxlength: [1000, 'Special Instruction cannot exceed 1000 characters']
  },
  transaction_status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  initialTransaction_status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  transaction_id: {
    type: Number,
    ref: 'Transaction',
    default: null
  },
  initialTransaction_id: {
    type: Number,
    ref: 'Transaction',
    default: null
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
  },
  actualAmount: {
    type: Number,
  },
  initial_payment: {
    type: Number,
  },
  pendingPayment: {
    type: Number,
  },
  platform_fee: {
    type: Number,
  },
  initialPerPayment: {
    type: Number,
  },
}, {
  timestamps: false,
  versionKey: false
});

staffEventBookSchema.plugin(AutoIncrement, { inc_field: 'staff_event_book_id' });

module.exports = mongoose.model('StaffEventBook', staffEventBookSchema);

