const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const availabilityCalenderSchema = new mongoose.Schema({
  Availability_Calender_id: {
    type: Number,
    unique: true
  },
  Year: {
    type: Number,
    required: [true, 'Year is required']
  },
  Month: {
    type: Number,
    required: [true, 'Month is required'],
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12']
  },
  Date_start: {
    type: Date,
    required: [true, 'Start date is required']
  },
  Start_time: {
    type: String,
    trim: true,
    default: null
  },
  End_time: {
    type: String,
    trim: true,
    default: null
  },
  End_date: {
    type: Date,
    default: null
  },
  Event_id: {
    type: Number,
    ref: 'Event',
    default: null
  },
  User_availabil: {
    type: String,
    enum: ['Book', 'leave'],
    default: 'Book'
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  Status: {
    type: Boolean,
    default: true
  },
  CreateBy: {
    type: Number,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  CreateAt: {
    type: Date,
    default: Date.now
  },
  UpdatedBy: {
    type: Number,
    ref: 'User',
    default: null
  },
  UpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  versionKey: false
});

availabilityCalenderSchema.plugin(AutoIncrement, { inc_field: 'Availability_Calender_id' });

module.exports = mongoose.model('Availability_Calender', availabilityCalenderSchema);

