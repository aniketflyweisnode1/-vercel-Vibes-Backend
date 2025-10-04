const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const eventTasksSchema = new mongoose.Schema({
  event_tasks_id: {
    type: Number,
    unique: true
  },
  taskTitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  emozi: {
    type: String,
    trim: true
  },
  confirmFinalGuestCount: {
    type: Boolean,
    default: false
  },
  finalizeMusicPlaylist: {
    type: Boolean,
    default: false
  },
  setupDecorations: {
    type: Boolean,
    default: false
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

eventTasksSchema.plugin(AutoIncrement, { inc_field: 'event_tasks_id' });


module.exports = mongoose.model('EventTasks', eventTasksSchema);
