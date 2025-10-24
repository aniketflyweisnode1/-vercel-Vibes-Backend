const Event = require('../models/event.model');
const VenueDetails = require('../models/venue_details.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEvent = asyncHandler(async (req, res) => {
  try {
    // Create event data
    const eventData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create event
    const event = await Event.create(eventData);
    
    // Note: Number references cannot be populated directly
    sendSuccess(res, event, 'Event created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all events with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllEvents = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      event_type_id,
      country_id,
      state_id,
      city_id,
      event_category_tags_id,
      ticketed_events,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { name_title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Add status filter
  

    // Add event_type_id filter
    if (event_type_id) {
      filter.event_type_id = event_type_id;
    }

    // Add country_id filter
    if (country_id) {
      filter.country_id = country_id;
    }

    // Add state_id filter
    if (state_id) {
      filter.state_id = state_id;
    }

    // Add city_id filter
    if (city_id) {
      filter.city_id = city_id;
    }

    // Add event_category_tags_id filter
    if (event_category_tags_id) {
      filter.event_category_tags_id = event_category_tags_id;
    }

    if (ticketed_events !== undefined) {
      filter.ticketed_events = true;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(filter)
    ]);

    // Manually populate all ID fields for each event
    const eventsWithPopulatedData = await Promise.all(events.map(async (event) => {
      const eventObj = event.toObject();
      
      // Populate event_type_id
      if (event.event_type_id) {
        try {
          const EventType = require('../models/event_type.model');
          const eventType = await EventType.findOne({ event_type_id: event.event_type_id });
          eventObj.event_type_id = eventType;
        } catch (error) {
          console.log('EventType not found for ID:', event.event_type_id);
        }
      }

      // Populate venue_details_id
      if (event.venue_details_id) {
        try {
          const VenueDetails = require('../models/venue_details.model');
          const venueDetails = await VenueDetails.findOne({
            venue_details_id: parseInt(event.venue_details_id)
          }).select('venue_details_id name address capacity type map');
          eventObj.venue_details_id = venueDetails;
        } catch (error) {
          console.log('VenueDetails not found for ID:', event.venue_details_id);
        }
      }

      // Populate country_id
      if (event.country_id) {
        try {
          const Country = require('../models/country.model');
          const country = await Country.findOne({ country_id: event.country_id });
          eventObj.country_id = country;
        } catch (error) {
          console.log('Country not found for ID:', event.country_id);
        }
      }

      // Populate state_id
      if (event.state_id) {
        try {
          const State = require('../models/state.model');
          const state = await State.findOne({ state_id: event.state_id });
          eventObj.state_id = state;
        } catch (error) {
          console.log('State not found for ID:', event.state_id);
        }
      }

      // Populate city_id
      if (event.city_id) {
        try {
          const City = require('../models/city.model');
          const city = await City.findOne({ city_id: event.city_id });
          eventObj.city_id = city;
        } catch (error) {
          console.log('City not found for ID:', event.city_id);
        }
      }

      // Populate event_category_tags_id
      if (event.event_category_tags_id) {
        try {
          const EventCategoryTags = require('../models/event_category_tags.model');
          const eventCategoryTags = await EventCategoryTags.findOne({ event_category_tags_id: event.event_category_tags_id });
          eventObj.event_category_tags_id = eventCategoryTags;
        } catch (error) {
          console.log('EventCategoryTags not found for ID:', event.event_category_tags_id);
        }
      }

      // Populate created_by
      if (event.created_by) {
        try {
          const User = require('../models/user.model');
          const createdByUser = await User.findOne({ user_id: event.created_by });
          eventObj.created_by = createdByUser;
        } catch (error) {
          console.log('User not found for created_by ID:', event.created_by);
        }
      }

      // Populate updated_by
      if (event.updated_by) {
        try {
          const User = require('../models/user.model');
          const updatedByUser = await User.findOne({ user_id: event.updated_by });
          eventObj.updated_by = updatedByUser;
        } catch (error) {
          console.log('User not found for updated_by ID:', event.updated_by);
        }
      }

      return eventObj;
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    };
    sendPaginated(res, eventsWithPopulatedData, pagination, 'Events retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get event by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Find event by event_id
    const event = await Event.findOne({event_id: parseInt(id)});

    if (!event) {
      return sendNotFound(res, 'Event not found');
    }

    // Manually fetch venue details if venue_details_id exists
    let eventWithVenue = event.toObject();
    if (event.venue_details_id) {
      const venueDetails = await VenueDetails.findOne({
        venue_details_id: parseInt(event.venue_details_id)
      }).select('venue_details_id name address capacity type map');
      
      eventWithVenue.venue_details = venueDetails;
    }

    sendSuccess(res, eventWithVenue, 'Event retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update event by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateEvent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const event = await Event.findOneAndUpdate(
      {event_id: parseInt(id)},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!event) {
      return sendNotFound(res, 'Event not found');
    }
    sendSuccess(res, event, 'Event updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete event by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteEvent = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOneAndUpdate(
      {event_id: parseInt(id)},
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!event) {
      return sendNotFound(res, 'Event not found');
    }
    sendSuccess(res, event, 'Event deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get events created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventsByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      event_type_id,
      country_id,
      state_id,
      city_id,
      event_category_tags_id,
      ticketed_events,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object - only show events created by the authenticated user
    const filter = {
      created_by: req.userId
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { name_title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Add status filter
  

    // Add event_type_id filter
    if (event_type_id) {
      filter.event_type_id = event_type_id;
    }

    // Add country_id filter
    if (country_id) {
      filter.country_id = country_id;
    }

    // Add state_id filter
    if (state_id) {
      filter.state_id = state_id;
    }

    // Add city_id filter
    if (city_id) {
      filter.city_id = city_id;
    }

    // Add event_category_tags_id filter
    if (event_category_tags_id) {
      filter.event_category_tags_id = event_category_tags_id;
    }

    // Add ticketed_events filter
    if (ticketed_events !== undefined) {
      filter.ticketed_events = ticketed_events === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(filter)
    ]);

    // Manually fetch venue details for each event
    const eventsWithVenues = await Promise.all(events.map(async (event) => {
      const eventObj = event.toObject();
      if (event.venue_details_id) {
        const venueDetails = await VenueDetails.findOne({
          venue_details_id: parseInt(event.venue_details_id)
        }).select('venue_details_id name address capacity type map');
        eventObj.venue_details = venueDetails;
      }
      return eventObj;
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    };
    sendPaginated(res, eventsWithVenues, pagination, 'User events retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByAuth
};

