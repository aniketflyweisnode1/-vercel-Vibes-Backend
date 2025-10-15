const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const communityDesignsSchema = new mongoose.Schema({
  community_designs_id: {
    type: Number,
    unique: true
  },
  categories_id: {
    type: Number,
    ref: 'Category',
    required: [true, 'Category ID is required']
  },
  image: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  sub_title: {
    type: String,
    trim: true,
    maxlength: [500, 'SubTitle cannot exceed 500 characters']
  },
  image_type: {
    type: String,
    enum: ['Intermediate', 'Beginner', 'Advanced'],
    required: [true, 'Image type is required']
  },
  image_sell_type: {
    type: String,
    enum: ['free', 'premium'],
    required: [true, 'Image sell type is required']
  },
  hash_tag: {
    type: [String],
    default: []
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  share: {
    type: Number,
    default: 0
  },
  remixes: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
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
  design_json_data: {
    type: String,
    trim: true
  },
  collaborators_user_id: [{
    id: {
      type: Number,
      ref: 'User',
      required: true
    },
    permission: {
      type: String,
      required: true,
      default: 'View'
    }
  }]
}, {
  timestamps: false,
  versionKey: false
});

communityDesignsSchema.plugin(AutoIncrement, { inc_field: 'community_designs_id' });

module.exports = mongoose.model('CommunityDesigns', communityDesignsSchema);

