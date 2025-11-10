const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const globalSearchSchema = new mongoose.Schema({
  GlobalSearch_id: {
    type: Number,
    unique: true
  },
  Page_Name: {
    type: String,
    required: [true, 'Page name is required'],
    trim: true,
    maxlength: [200, 'Page name cannot exceed 200 characters']
  },
  Page_Routes: {
    type: String,
    required: [true, 'Page route is required'],
    trim: true,
    maxlength: [500, 'Page route cannot exceed 500 characters']
  },
  Page_content: {
    type: String,
    required: [true, 'Page content is required'],
    trim: true
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

globalSearchSchema.plugin(AutoIncrement, { inc_field: 'GlobalSearch_id' });

globalSearchSchema.index({ Page_Name: 1 });
globalSearchSchema.index({ Page_Routes: 1 });
globalSearchSchema.index({ Page_content: 'text' });

module.exports = mongoose.model('GlobalSearch', globalSearchSchema);

