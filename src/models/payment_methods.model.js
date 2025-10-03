const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const paymentMethodsSchema = new mongoose.Schema({
  payment_methods_id: {
    type: Number,
    unique: true
  },
  payment_method: {
    type: String,
    required: [true, 'Payment method is required'],
    trim: true,
    maxlength: [100, 'Payment method cannot exceed 100 characters']
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
  }
}, {
  timestamps: false, // We're using custom timestamp fields
  versionKey: false
});

paymentMethodsSchema.plugin(AutoIncrement, { inc_field: 'payment_methods_id' });

module.exports = mongoose.model('PaymentMethods', paymentMethodsSchema);
