const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const guestSchema = new mongoose.Schema({
  guest_id: {
    type: Number,
    unique: true
  },
  role_id: {
    type: String,
  },
  name: {
    type: String,
    trim: true
  },
  mobileno: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  specialnote: {
    type: String,
    trim: true
  },
  img: {
    type: String,
    trim: true
  },
  event_id: {
    type: Number,
    ref: 'Event',
    default: null
  },
  status: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Number,
    ref: 'User',
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

guestSchema.plugin(AutoIncrement, { inc_field: 'guest_id' });


module.exports = mongoose.model('Guest', guestSchema);
