const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const eventSetupRequirementsSchema = new mongoose.Schema({
  setup_requirements_id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    min: 1
  },
  image: {
    type: String,
    trim: true
  },
  emozi: {
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
    default: null
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


  eventSetupRequirementsSchema.plugin(AutoIncrement, { inc_field: 'setup_requirements_id' });
 

module.exports = mongoose.model('EventSetupRequirements', eventSetupRequirementsSchema);
