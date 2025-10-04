const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const itemsSchema = new mongoose.Schema({
  items_id: {
    type: Number,
    unique: true
  },
  item_Category_id: {
    type: Number,
    ref: 'ItemCategory',
   
  },
  item_name: {
    type: String,
   
    trim: true
  },
  item_price: {
    type: Number,
   
    min: 0
  },
  item_brand: {
    type: String,
   
    trim: true
  },
  item_color: {
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

 
  itemsSchema.plugin(AutoIncrement, { inc_field: 'items_id' });


module.exports = mongoose.model('Items', itemsSchema);
