const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const eventSchema = new mongoose.Schema({
  event_id: {
    type: Number,
    unique: true
  },
  name_title: {
    type: String,
    required: [true, 'Name/Title is required'],
    trim: true,
    maxlength: [200, 'Name/Title cannot exceed 200 characters']
  },
  event_type_id: {
    type: Number,
    ref: 'EventType'
  },
  ticketed_events: {
    type: Boolean,
    default: false
  },
  Event_type: {
    type: String,
    enum: ['Private', 'Public'],
    default: 'Public'
  },
  EntryPrice: {
    type: Number,
    default: 0,
    min: [0, 'Entry price cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  venue_details_id: {
    type: Number,
    ref: 'VenueDetails',
    required: [true, 'Venue details ID is required']
  },
  street_address: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, 'Street address cannot exceed 500 characters']
  },
  country_id: {
    type: Number,
    ref: 'Country',
    default: 1
  },
  state_id: {
    type: Number,
    ref: 'State',
    default: 1
  },
  city_id: {
    type: Number,
    ref: 'City',
    default: 1
  },
  event_category_tags_id: {
    type: Number,
    ref: 'EventCategoryTags',
    default: 1
  },
  tags: {
    type: [String],
    default: []
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
    trim: true
  },
  max_capacity: {
    type: Number,
    required: [true, 'Max capacity is required'],
    min: [1, 'Max capacity must be at least 1']
  },
  event_image: {
    type: String,
    trim: true,
    default: null
  },
  live_vibes_invite_videos: {
    type: [String],
    default: []
  },
  live_vibes_invite_venue_tour: {
    type: [String],
    default: []
  },
  live_vibes_invite_music_preview: {
    type: [String],
    default: []
  },
  live_vibes_invite_vip_perks: {
    type: [String],
    default: []
  },
  BudgetRange: {
    type: Number,
    default: null,
    min: [0, 'Budget range cannot be negative']
  },
  ExpectedGuestCount: {
    type: Number,
    default: null,
    min: [0, 'Expected guest count cannot be negative']
  },
  ThemeOrStyle: {
    type: [String],
    default: []
  },
  MusicPreferences: {
    type: [String],
    default: []
  },
  DietaryRestrictionsAllergies: {
    type: String,
    trim: true,
    default: null,
    maxlength: [1000, 'Dietary restrictions/allergies cannot exceed 1000 characters']
  },
  SpecialRequestsNotes: {
    type: String,
    trim: true,
    default: null,
    maxlength: [2000, 'Special requests/notes cannot exceed 2000 characters']
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
  }
}, {
  timestamps: false, // We're using custom timestamp fields
  versionKey: false
});

eventSchema.plugin(AutoIncrement, { inc_field: 'event_id' });

module.exports = mongoose.model('Event', eventSchema);
