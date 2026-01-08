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
const QRCode = require('qrcode');
const file_upload = require('../controllers/file_upload.controller');
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

    console.log('Creating event: \n', req.body);
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
    if (req.body.budget_min !== undefined && req.body.budget_min !== null) {
      eventData.budget_min = Number(req.body.budget_min);
    }
    if (req.body.budget_max !== undefined && req.body.budget_max !== null) {
      eventData.budget_max = Number(req.body.budget_max);
    }
    if (req.body.ExpectedGuestCount !== undefined && req.body.ExpectedGuestCount !== null) {
      eventData.ExpectedGuestCount = Number(req.body.ExpectedGuestCount);
    }

    // Create event
    const event = await Event.create(eventData);

    if (event.Event_type === 'Public') {
      try {
        console.log('Creating automatic ticket for public event: \n', event.event_id, req.body.ticketData);

        // Check if ticketData exists and is a valid array with required fields
        if (req.body.ticketData &&
          Array.isArray(req.body.ticketData) &&
          req.body.ticketData.length > 0) {

          // Validate that at least one ticket has required fields
          const isValidTicketData = req.body.ticketData.some(ticket =>
            ticket.ticket_type_id !== undefined &&
            ticket.ticket_query &&
            ticket.price !== undefined
          );

          if (isValidTicketData) {
            // Prepare ticket details array - ensure all items have required fields
            const ticketData = req.body.ticketData.map(ticket => ({
              ticket_type_id: ticket.ticket_type_id,
              ticket_query: ticket.ticket_query,
              price: ticket.price
            })).filter(ticket =>
              ticket.ticket_type_id !== undefined &&
              ticket.ticket_query &&
              ticket.price !== undefined
            );

            if (ticketData.length > 0) {
              console.log('Ticket details:', ticketData);

              // Create ticket
              const ticket = await Ticket.create({
                event_id: event.event_id,
                ticketDateils: ticketData,
                max_capacity: req.body.max_capacity,
                status: true,
                created_by: req.userId || event.created_by
              });

              console.log('Ticket created successfully:', ticket.ticket_id);
            } else {
              console.log('Skipping automatic ticket creation: No valid ticket data found');
            }
          } else {
            console.log('Skipping automatic ticket creation: ticketData array is empty or missing required fields');
          }
        } else {
          console.log('Skipping automatic ticket creation: ticketData not provided or not an array');
        }
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
          const qrPayload = {
            event_id: event.event_id,
            vendorName: user.name,
          };
          const qrString = JSON.stringify(qrPayload);
          const qrCodeBase64 = await QRCode.toDataURL(qrString, {
            width: 200,
            margin: 1,
            errorCorrectionLevel: 'M'
          });
          const imageData = await file_upload.uploadBase64File(qrCodeBase64);
          if (imageData) {
            const emailEventData = {
              title: event.name_title || 'Event',
              date: event.date,
              time: event.time,
              location: event.street_address || 'Location TBD',
              description: event.description || '',
              qrCode: imageData.url
            };
            // Send email with calendar attachment
            await emailService.sendEventCreatedEmail(user.email, emailEventData, user.name || 'User', user.email);
          }
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
      user_id,
      min_price,
      max_price,
      budget_min,
      budget_max,
      DateRange,
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

    if (Event_type !== undefined) {
      filter.Event_type = 'Public';
    }

    // Exclude events created by user_id if provided
    if (user_id) {
      filter.created_by = { $ne: parseInt(user_id) };
    }

    // Add price range filter
    if (min_price !== undefined || max_price !== undefined) {
      filter.EntryPrice = {};
      if (min_price !== undefined) {
        filter.EntryPrice.$gte = parseFloat(min_price);
      }
      if (max_price !== undefined) {
        filter.EntryPrice.$lte = parseFloat(max_price);
      }
    }

    // Add budget range filter
    // Filter events where budget range overlaps with requested range
    if (budget_min !== undefined || budget_max !== undefined) {
      if (budget_min !== undefined && budget_max !== undefined) {
        // Find events where budget range overlaps with [budget_min, budget_max]
        // Event's budget_max >= requested budget_min AND Event's budget_min <= requested budget_max
        // Also include events where budget fields are null (no budget specified)
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { budget_max: { $gte: parseFloat(budget_min) } },
            { budget_max: null }
          ]
        });
        filter.$and.push({
          $or: [
            { budget_min: { $lte: parseFloat(budget_max) } },
            { budget_min: null }
          ]
        });
      } else if (budget_min !== undefined) {
        // Filter events where budget_max >= budget_min (or budget_max is null)
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { budget_max: { $gte: parseFloat(budget_min) } },
            { budget_max: null }
          ]
        });
      } else if (budget_max !== undefined) {
        // Filter events where budget_min <= budget_max (or budget_min is null)
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { budget_min: { $lte: parseFloat(budget_max) } },
            { budget_min: null }
          ]
        });
      }
    }

    // Add date range filter
    if (DateRange) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      let endDate = new Date();

      switch (DateRange.toLowerCase()) {
        case 'day':
          endDate.setHours(23, 59, 59, 999); // End of today
          break;
        case 'week':
          endDate.setDate(today.getDate() + 7);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'month':
          endDate.setDate(today.getDate() + 30);
          endDate.setHours(23, 59, 59, 999);
          break;
        case '3month':
          endDate.setDate(today.getDate() + 90);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          // Invalid DateRange, skip filter
          break;
      }

      if (DateRange.toLowerCase() === 'day' ||
        DateRange.toLowerCase() === 'week' ||
        DateRange.toLowerCase() === 'month' ||
        DateRange.toLowerCase() === '3month') {
        filter.date = {
          $gte: today,
          $lte: endDate
        };
      }
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
          const EventTicketsSeats = require('../models/event_tickets_seats.model');
          const tickets = await EventTicketsSeats.find({
            event_id: event.event_id,
            status: true
          }).select('event_tickets_seats_id seat_no firstName lastName email phoneNo promo_code loyalty_points capacity type map status');
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

      // Populate Ticket model full details
      if (event.event_id) {
        try {
          const tickets = await Ticket.find({
            event_id: event.event_id,
            status: true
          });
          eventObj.EventTicketsData = tickets || [];
        } catch (error) {
          console.log('Error fetching Ticket model details for event ID:', event.event_id, error);
          eventObj.EventTicketsData = [];
        }
      } else {
        eventObj.EventTicketsData = [];
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
    const event = await Event.findOne({ event_id: parseInt(id) });

    if (!event) {
      return sendNotFound(res, 'Event not found');
    }

    // Manually populate all ID fields
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

    // Populate ticket details (EventEntryTickets)
    if (event.event_id) {
      try {
        const EventEntryTickets = require('../models/event_entry_tickets.model');
        const User = require('../models/user.model');
        const tickets = await EventEntryTickets.find({
          event_id: event.event_id,
          status: true
        }).select('event_entry_tickets_id title price total_seats facility tag status createdBy updatedBy createdAt updatedAt');

        // Populate createdBy and updatedBy for each ticket
        const ticketsWithPopulatedIds = await Promise.all(tickets.map(async (ticket) => {
          const ticketObj = ticket.toObject();

          // Populate createdBy
          if (ticket.createdBy) {
            try {
              const createdByUser = await User.findOne({ user_id: ticket.createdBy });
              ticketObj.createdBy = createdByUser;
            } catch (error) {
              console.log('User not found for createdBy ID:', ticket.createdBy);
            }
          }

          // Populate updatedBy
          if (ticket.updatedBy) {
            try {
              const updatedByUser = await User.findOne({ user_id: ticket.updatedBy });
              ticketObj.updatedBy = updatedByUser;
            } catch (error) {
              console.log('User not found for updatedBy ID:', ticket.updatedBy);
            }
          }

          return ticketObj;
        }));

        eventObj.ticket_details = ticketsWithPopulatedIds || [];
      } catch (error) {
        console.log('Error fetching ticket details for event ID:', event.event_id, error);
        eventObj.ticket_details = [];
      }
    } else {
      eventObj.ticket_details = [];
    }

    // Calculate total tickets booked for this event and get seats booking details
    if (event.event_id) {
      try {
        const EventEntryTicketsOrder = require('../models/event_entry_tickets_order.model');
        const Transaction = require('../models/transaction.model');
        const User = require('../models/user.model');

        const ticketOrders = await EventEntryTicketsOrder.find({
          event_id: event.event_id,
          status: true
        }).select('event_entry_tickets_order_id event_entry_userget_tickets_id event_id quantity price seats subtotal tax total coupon_code_id discount_amount final_amount Platform status createdBy updatedBy createdAt updatedAt');

        // Sum up all quantities
        const totalTicketsBooked = ticketOrders.reduce((sum, order) => {
          return sum + (order.quantity || 0);
        }, 0);

        eventObj.TotalofTicketsBookingbyEvent = totalTicketsBooked;

        // Get seats booking details with payment status
        const seatsBookingDetails = await Promise.all(ticketOrders.map(async (order) => {
          const orderObj = order.toObject();

          // Check if payment is completed for this order
          let paymentStatus = 'pending';
          let transaction = null;

          try {
            const transactions = await Transaction.find({
              transactionType: 'TicketBooking',
              status: 'completed'
            });

            // Find transaction for this order by checking metadata
            for (const txn of transactions) {
              if (txn.metadata) {
                try {
                  const metadata = JSON.parse(txn.metadata);
                  if (metadata.order_id === order.event_entry_tickets_order_id) {
                    transaction = txn;
                    paymentStatus = 'completed';
                    break;
                  }
                } catch (e) {
                  // Skip if metadata parsing fails
                }
              }
            }
          } catch (error) {
            console.log('Error checking payment status for order:', order.event_entry_tickets_order_id, error);
          }

          // Populate createdBy
          if (order.createdBy) {
            try {
              const createdByUser = await User.findOne({ user_id: order.createdBy });
              orderObj.createdBy = createdByUser;
            } catch (error) {
              console.log('User not found for createdBy ID:', order.createdBy);
            }
          }

          // Populate updatedBy
          if (order.updatedBy) {
            try {
              const updatedByUser = await User.findOne({ user_id: order.updatedBy });
              orderObj.updatedBy = updatedByUser;
            } catch (error) {
              console.log('User not found for updatedBy ID:', order.updatedBy);
            }
          }

          return {
            ...orderObj,
            payment_status: paymentStatus,
            transaction: transaction ? {
              transaction_id: transaction.transaction_id,
              status: transaction.status,
              amount: transaction.amount,
              transaction_date: transaction.transaction_date,
              reference_number: transaction.reference_number
            } : null
          };
        }));

        eventObj.seats_booking_details = seatsBookingDetails || [];
      } catch (error) {
        console.log('Error calculating total tickets booked for event ID:', event.event_id, error);
        eventObj.TotalofTicketsBookingbyEvent = 0;
        eventObj.seats_booking_details = [];
      }
    } else {
      eventObj.TotalofTicketsBookingbyEvent = 0;
      eventObj.seats_booking_details = [];
    }

    // Populate Ticket model full details with all nested IDs
    if (event.event_id) {
      try {
        const Ticket = require('../models/ticket.model');
        const TicketType = require('../models/ticket_type.model');
        const User = require('../models/user.model');
        const tickets = await Ticket.find({
          event_id: event.event_id,
          status: true
        });

        // Populate all IDs within tickets
        const ticketsWithPopulatedIds = await Promise.all(tickets.map(async (ticket) => {
          const ticketObj = ticket.toObject();

          // Populate ticket_type_id within ticketDateils array
          if (ticketObj.ticketDateils && Array.isArray(ticketObj.ticketDateils)) {
            ticketObj.ticketDateils = await Promise.all(ticketObj.ticketDateils.map(async (ticketDetail) => {
              if (ticketDetail.ticket_type_id) {
                try {
                  const ticketType = await TicketType.findOne({ ticket_type_id: ticketDetail.ticket_type_id });
                  return {
                    ...ticketDetail,
                    ticket_type_id: ticketType
                  };
                } catch (error) {
                  console.log('TicketType not found for ID:', ticketDetail.ticket_type_id);
                  return ticketDetail;
                }
              }
              return ticketDetail;
            }));
          }

          // Populate created_by
          if (ticket.created_by) {
            try {
              const createdByUser = await User.findOne({ user_id: ticket.created_by });
              ticketObj.created_by = createdByUser;
            } catch (error) {
              console.log('User not found for created_by ID:', ticket.created_by);
            }
          }

          // Populate updated_by
          if (ticket.updated_by) {
            try {
              const updatedByUser = await User.findOne({ user_id: ticket.updated_by });
              ticketObj.updated_by = updatedByUser;
            } catch (error) {
              console.log('User not found for updated_by ID:', ticket.updated_by);
            }
          }

          return ticketObj;
        }));

        eventObj.EventTicketsData = ticketsWithPopulatedIds || [];
      } catch (error) {
        console.log('Error fetching Ticket model details for event ID:', event.event_id, error);
        eventObj.EventTicketsData = [];
      }
    } else {
      eventObj.EventTicketsData = [];
    }

    sendSuccess(res, eventObj, 'Event retrieved successfully');
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
      { event_id: parseInt(id) },
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
      { event_id: parseInt(id) },
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

    // Calculate 7% platform fee
    const PLATFORM_FEE_PERCENTAGE = 0.07; // 7%
    const baseAmount = normalizedAmount; // Base amount (what event host should receive)
    const platformFeeAmount = baseAmount * PLATFORM_FEE_PERCENTAGE;
    const totalAmount = baseAmount + platformFeeAmount; // Customer pays: base + 7% platform fee

    // Event host receives baseAmount, Admin receives platformFeeAmount
    const eventHostAmount = baseAmount; // Event host receives base amount only

    // Get event to find event host (created_by)
    let eventHostId = null;
    if (event_id) {
      const event = await Event.findOne({ event_id: parseInt(event_id) });
      eventHostId = event ? event.created_by : null;
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
        amount: Math.round(totalAmount), // Customer pays total (base + platform fee)
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

    // Create transaction record for customer
    const transactionData = {
      user_id: req.userId,
      amount: totalAmount, // Customer pays total (base + platform fee)
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
        event_host_id: eventHostId,
        base_amount: baseAmount,
        platform_fee: platformFeeAmount,
        platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
        event_host_amount: eventHostAmount,
        description
      }),
      created_by: req.userId
    };

    const customerTransaction = await Transaction.create(transactionData);

    // Create event host transaction - Event host receives baseAmount only
    if (eventHostId && eventHostAmount > 0) {
      const eventHostUser = await User.findOne({ user_id: eventHostId, status: true });

      if (eventHostUser) {
        const eventHostTransactionData = {
          user_id: eventHostId, // Event host user ID
          amount: eventHostAmount, // Event host receives baseAmount only
          status: paymentIntent.status,
          payment_method_id: parseInt(payment_method_id, 10),
          transactionType: 'EventPayment',
          transaction_date: new Date(),
          reference_number: `EVENT_HOST_PAYMENT_${paymentIntent.paymentIntentId}`,
          coupon_code_id: null,
          CGST: 0,
          SGST: 0,
          TotalGST: 0,
          metadata: JSON.stringify({
            payment_intent_id: paymentIntent.paymentIntentId,
            stripe_payment_intent_id: paymentIntent.paymentIntentId,
            event_id: event_id || null,
            event_host_id: eventHostId,
            customer_user_id: req.userId,
            base_amount: baseAmount,
            platform_fee: platformFeeAmount,
            platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
            event_host_amount: eventHostAmount, // Event host receives baseAmount
            total_amount: totalAmount,
            customer_transaction_id: customerTransaction.transaction_id,
            description: 'Event host receives base amount from event payment'
          }),
          created_by: req.userId
        };

        await Transaction.create(eventHostTransactionData);
      }
    }

    // Create admin transaction for platform fee only
    // Admin receives only the 7% platform fee
    const adminUser = await User.findOne({ role_id: 1, status: true }).sort({ user_id: 1 });

    if (adminUser && platformFeeAmount > 0) {
      const adminTransactionData = {
        user_id: adminUser.user_id,
        amount: platformFeeAmount, // Admin receives only platform fee (7%)
        status: paymentIntent.status,
        payment_method_id: parseInt(payment_method_id, 10),
        transactionType: 'EventPayment',
        transaction_date: new Date(),
        reference_number: `PLATFORM_FEE_${paymentIntent.paymentIntentId}`,
        coupon_code_id: null,
        CGST: 0,
        SGST: 0,
        TotalGST: 0,
        metadata: JSON.stringify({
          payment_intent_id: paymentIntent.paymentIntentId,
          stripe_payment_intent_id: paymentIntent.paymentIntentId,
          event_id: event_id || null,
          event_host_id: eventHostId,
          customer_user_id: req.userId,
          base_amount: baseAmount,
          platform_fee: platformFeeAmount,
          platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
          event_host_amount: eventHostAmount, // Event host receives baseAmount
          total_amount: totalAmount,
          customer_transaction_id: customerTransaction.transaction_id,
          description: 'Platform fee (7%) from event payment - Admin receives platform fee'
        }),
        created_by: req.userId
      };

      await Transaction.create(adminTransactionData);
    }

    // Success response
    return sendSuccess(res, {
      customer_transaction_id: customerTransaction.transaction_id,
      payment_intent_id: paymentIntent.paymentIntentId,
      client_secret: paymentIntent.clientSecret,
      payment_breakdown: {
        total_amount: totalAmount, // Customer pays this (baseAmount + platformFeeAmount)
        base_amount: baseAmount, // Event host receives this
        platform_fee: platformFeeAmount, // Admin receives this (7%)
        platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
        event_host_amount: eventHostAmount // Event host receives baseAmount only
      },
      transactions: {
        customer: {
          transaction_id: customerTransaction.transaction_id,
          user_id: req.userId,
          amount: totalAmount,
          description: 'Customer payment for event (baseAmount + platformFee)'
        },
        event_host: {
          user_id: eventHostId,
          amount: eventHostAmount, // baseAmount
          description: 'Event host receives base amount'
        },
        admin: {
          user_id: adminUser ? adminUser.user_id : null,
          amount: platformFeeAmount,
          description: 'Admin receives 7% platform fee'
        }
      },
      currency: 'USD',
      status: paymentIntent.status,
      paymentIntent: {
        id: paymentIntent.paymentIntentId,
        clientSecret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      },
      event_id: event_id || null
    }, 'Event payment processed successfully. Three transactions created: Customer pays total amount, Event host receives base amount, Admin receives 7% platform fee.');
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

/**
 * Get all events excluding events created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getEventsExcludingAuth = asyncHandler(async (req, res) => {
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

    // Build filter object - exclude events created by the authenticated user
    const filter = {
      created_by: { $ne: req.userId }
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
    sendPaginated(res, eventsWithPopulatedData, pagination, 'Events retrieved successfully (excluding current user)');
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
  getEventsExcludingAuth,
  eventPayment
};

