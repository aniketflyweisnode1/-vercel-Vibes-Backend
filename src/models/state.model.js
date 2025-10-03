const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const stateSchema = new mongoose.Schema({
  state_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  country_id: {
    type: Number,
    ref: 'Country',
    required: [true, 'Country ID is required']
  },
  status: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: Number,

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

stateSchema.plugin(AutoIncrement, { inc_field: 'state_id' });

module.exports = mongoose.model('State', stateSchema);
