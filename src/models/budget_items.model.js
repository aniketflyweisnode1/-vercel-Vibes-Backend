const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const budgetItemsSchema = new mongoose.Schema({
  budget_items_id: {
    type: Number,
    unique: true
  },
  items: [{
    item_id: {
      type: Number,
      ref: 'Items',
      default: null
    },
    category_id: {
      type: Number,
      ref: 'ItemCategory',
      default: null
    },
    price: {
      type: Number,
      default: null,
      min: 0
    }
  }],
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



budgetItemsSchema.plugin(AutoIncrement, { inc_field: 'budget_items_id' });

module.exports = mongoose.model('BudgetItems', budgetItemsSchema);
