const Event = require('../models/event.model');
const VenueDetails = require('../models/venue_details.model');
const User = require('../models/user.model');
const Ticket = require('../models/ticket.model');
const emailService = require('../../utils/emailService');
const Transaction = require('../models/transaction.model');
const { createPaymentIntent, createCustomer } = require('../../utils/stripe');
const { createNotificationHendlar } = require('../../utils/notificationHandler');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new event
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createEvent = asyncHandler(async (req, res) => {
  try {
    // Process array fields to ensure they are arrays
    const processArrayField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [field];
        } catch {
          return [field];
        }
      }
      return [];
    };

    // Create event data
    const eventData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Process array fields
    if (req.body.ThemeOrStyle !== undefined) {
      eventData.ThemeOrStyle = processArrayField(req.body.ThemeOrStyle);
    }
    if (req.body.MusicPreferences !== undefined) {
      eventData.MusicPreferences = processArrayField(req.body.MusicPreferences);
    }

    // Ensure numeric fields are numbers
    if (req.body.BudgetRange !== undefined && req.body.BudgetRange !== null) {
      eventData.BudgetRange = Number(req.body.BudgetRange);
    }
    if (req.body.ExpectedGuestCount !== undefined && req.body.ExpectedGuestCount !== null) {
      eventData.ExpectedGuestCount = Number(req.body.ExpectedGuestCount);
    }

    // Create event
    const event = await Event.create(eventData);

    if (event.Event_type === 'Public' && event.EntryPrice > 0) {
      try {
      const ticketDateils = [
        {
          ticket_type_id: 1,
          ticket_query: `Automatic ticket created for public event ${event.event_id}`,
          price: Number(event.EntryPrice) || 0
        }
      ];

        await Ticket.create({
          event_id: event.event_id,
          ticketDateils,
          status: true,
          created_by: req.userId || event.created_by
        });
      } catch (ticketError) {
        console.error('Failed to create automatic ticket for public event:', ticketError);
      }
    }
    
    // Send email with calendar attachment to the user who created the event
    try {
      const userId = req.userId || event.created_by;
      if (userId) {
        // Fetch user details
        const user = await User.findOne({ user_id: userId }).select('email name');
        
        if (user && user.email) {
          // Prepare event data for email
          const emailEventData = {
            title: event.name_title || 'Event',
            date: event.date,
            time: event.time,
            location: event.street_address || 'Location TBD',
            description: event.description || ''
          };

          // Send email with calendar attachment
          await emailService.sendEventCreatedEmail(
            user.email,
            emailEventData,
            user.name || 'User',
            user.email
          );
        }
      }
    } catch (emailError) {
      // Log email error but don't fail the event creation
      console.error('Failed to send event creation email:', emailError);
      // Continue with success response even if email fails
    }

    // Create notification for event creation
    try {
      const userId = req.userId || event.created_by;
      if (userId) {
        await createNotificationHendlar(
          userId,
          1, // Notification type ID: 1 = Event related
          `Your event "${event.name_title || 'Event'}" has been created successfully.`,
          userId
        );
      }
    } catch (notificationError) {
      // Log notification error but don't fail the event creation
      console.error('Failed to create event notification:', notificationError);
    }
    
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
      Event_type,
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

    // Add Event_type filter (Private/Public)
    if (Event_type) {
      filter.Event_type = Event_type;
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

      // Populate ticket details
      if (event.event_id) {
        try {
          const EventEntryTickets = require('../models/event_entry_tickets.model');
          const tickets = await EventEntryTickets.find({
            event_id: event.event_id,
            status: true
          }).select('event_entry_tickets_id title price total_seats facility tag status');
          eventObj.ticket_details = tickets || [];
        } catch (error) {
          console.log('Error fetching ticket details for event ID:', event.event_id, error);
          eventObj.ticket_details = [];
        }
      } else {
        eventObj.ticket_details = [];
      }

      // Calculate total tickets booked for this event
      if (event.event_id) {
        try {
          const EventEntryTicketsOrder = require('../models/event_entry_tickets_order.model');
          const ticketOrders = await EventEntryTicketsOrder.find({
            event_id: event.event_id,
            status: true
          }).select('quantity');
          
          // Sum up all quantities
          const totalTicketsBooked = ticketOrders.reduce((sum, order) => {
            return sum + (order.quantity || 0);
          }, 0);
          
          eventObj.TotalofTicketsBookingbyEvent = totalTicketsBooked;
        } catch (error) {
          console.log('Error calculating total tickets booked for event ID:', event.event_id, error);
          eventObj.TotalofTicketsBookingbyEvent = 0;
        }
      } else {
        eventObj.TotalofTicketsBookingbyEvent = 0;
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

    // Create notification for event update
    try {
      if (event.created_by) {
        await createNotificationHendlar(
          event.created_by,
          1, // Notification type ID: 1 = Event related
          `Your event "${event.name_title || 'Event'}" has been updated successfully.`,
          req.userId || event.created_by
        );
      }
    } catch (notificationError) {
      console.error('Failed to create event update notification:', notificationError);
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

    // Create notification for event deletion
    try {
      if (event.created_by) {
        await createNotificationHendlar(
          event.created_by,
          1, // Notification type ID: 1 = Event related
          `Your event "${event.name_title || 'Event'}" has been deleted.`,
          req.userId || event.created_by
        );
      }
    } catch (notificationError) {
      console.error('Failed to create event deletion notification:', notificationError);
    }

    sendSuccess(res, event, 'Event deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Create Stripe payment intent for an event and record a transaction
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const eventPayment = asyncHandler(async (req, res) => {
  try {
    const {
      amount,
      payment_method_id,
      billingDetails,
      description = 'Event payment',
      event_id
    } = req.body;

    // Validate required fields
    if (amount === undefined || amount === null) {
      return sendError(res, 'Amount is required', 400);
    }
    if (!payment_method_id) {
      return sendError(res, 'payment_method_id is required', 400);
    }

    // Normalize and validate
    const normalizedAmount = Number(amount);
    if (Number.isNaN(normalizedAmount)) {
      return sendError(res, 'Invalid amount. It must be a numeric value.', 400);
    }
    if (normalizedAmount <= 0) {
      return sendError(res, 'Amount must be greater than 0', 400);
    }

    // Fetch user for email
    const user = await User.findOne({ user_id: req.userId }).select('email name');
    if (!user || !user.email) {
      return sendError(res, 'User email not found for Stripe receipt', 400);
    }

    // Optionally create/reuse a customer in Stripe (simple metadata-only for now)
    const customerId = undefined;

    // Create payment intent
    let paymentIntent = null;
    try {
      const paymentOptions = {
        amount: Math.round(normalizedAmount),
        billingDetails,
        currency: 'usd',
        customerEmail: user.email,
        metadata: {
          user_id: req.userId,
          event_id: event_id || '',
          payment_type: 'event_payment',
          description
        }
      };

      paymentIntent = await createPaymentIntent(paymentOptions);
    } catch (paymentError) {
      return sendError(res, `Payment intent creation failed: ${paymentError.message}`, 400);
    }

    // Create transaction record
    const transactionData = {
      user_id: req.userId,
      amount: normalizedAmount,
      status: paymentIntent.status,
      payment_method_id: payment_method_id,
      transactionType: 'EventPayment',
      transaction_date: new Date(),
      reference_number: paymentIntent.paymentIntentId,
      coupon_code_id: null,
      CGST: 0,
      SGST: 0,
      TotalGST: 0,
      metadata: JSON.stringify({
        stripe_payment_intent_id: paymentIntent.paymentIntentId,
        stripe_client_secret: paymentIntent.clientSecret,
        event_id: event_id || null,
        description
      }),
      created_by: req.userId
    };

    const transaction = await Transaction.create(transactionData);

    // Success response
    return sendSuccess(res, {
      transaction_id: transaction.transaction_id,
      payment_intent_id: paymentIntent.paymentIntentId,
      client_secret: paymentIntent.clientSecret,
      amount: normalizedAmount,
      currency: 'USD',
      status: paymentIntent.status,
      paymentIntent: {
        id: paymentIntent.paymentIntentId,
        clientSecret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      },
      event_id: event_id || null,
      message: 'Event payment intent created successfully'
    }, 'Event payment intent created successfully');
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
      Event_type,
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

    // Add Event_type filter (Private/Public)
    if (Event_type) {
      filter.Event_type = Event_type;
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
  getEventsByAuth,
  eventPayment
};

