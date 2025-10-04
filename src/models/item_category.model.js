const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const itemCategorySchema = new mongoose.Schema({
  item_category_id: {
    type: Number,
    unique: true
  },
  categorytxt: {
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

  itemCategorySchema.plugin(AutoIncrement, { inc_field: 'item_category_id' });

module.exports = mongoose.model('ItemCategory', itemCategorySchema);
