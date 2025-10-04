const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const planEventMapSchema = new mongoose.Schema({
  plan_event_id: {
    type: Number,
    unique: true
  },
  event_id: {
    type: Number,
    ref: 'Event',
   
  },
  menu_drinks: [{
    type: Number,
    ref: 'Drinks'
  }],
  menu_food: [{
    type: Number,
    ref: 'Food'
  }],
  menu_entertainment: [{
    type: Number,
    ref: 'Entertainment'
  }],
  menu_decorations: [{
    type: Number,
    ref: 'Decorations'
  }],
  tasks: [{
    type: Number,
    ref: 'EventTasks'
  }],
  chat: [{
    type: Number,
    ref: 'EventDiscussionChat'
  }],
  budget_items_id: [{
    type: Number,
    ref: 'BudgetItems'
  }],
  venue_management: {
    venue_details: {
      type: Number,
      ref: 'VenueDetails'
    },
    amenities_id: [{
      type: Number,
      ref: 'EventAmenities'
    }],
    setup_requirements: [{
      setup_requirements_id: {
        type: Number,
        ref: 'EventSetupRequirements'
      },
      setup_status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Confirmed', 'Completed'],
        default: 'Pending'
      }
    }]
  },
  event_gallery: [{
    type: Number,
    ref: 'EventGallery'
  }],
  guests_id: [{
    guest_id: {
      type: Number,
      ref: 'Guest'
    },
    invite_status: {
      type: String,
      enum: ['Confirmed', 'Pending', 'Declined', 'Maybe'],
      default: 'Pending'
    }
  }],
  transaction_id: {
    type: Number,
    ref: 'Transaction',
    default: null
  },
  payment_status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
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


  planEventMapSchema.plugin(AutoIncrement, { inc_field: 'plan_event_id' });


module.exports = mongoose.model('PlanEventMap', planEventMapSchema);
