const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const venueDetailsSchema = new mongoose.Schema({
  venue_details_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
   
    trim: true
  },
  address: {
    type: String,
   
    trim: true
  },
  capacity: {
    type: Number,
   
    min: 1
  },
  type: {
    type: String,
   
    trim: true
  },
  map: {
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


venueDetailsSchema.plugin(AutoIncrement, { inc_field: 'venue_details_id' });

module.exports = mongoose.model('VenueDetails', venueDetailsSchema);
