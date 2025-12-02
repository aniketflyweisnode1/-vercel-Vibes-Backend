const Joi = require('joi');

/**
 * Event validation schemas using Joi
 */

// Common validation patterns
const commonValidations = {
  name_title: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Name/Title is required',
      'string.min': 'Name/Title must be at least 2 characters long',
      'string.max': 'Name/Title cannot exceed 200 characters'
    }),

  event_type_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Event Type ID must be a number',
      'number.integer': 'Event Type ID must be an integer',
      'number.positive': 'Event Type ID must be a positive number'
    }),

  ticketed_events: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Ticketed Events must be a boolean value'
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 2000 characters'
    }),

  venue_details_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Venue details ID must be a number',
      'number.integer': 'Venue details ID must be an integer',
      'number.positive': 'Venue details ID must be a positive number',
      'any.required': 'Venue details ID is required'
    }),

  street_address: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Street address is required',
      'string.min': 'Street address must be at least 10 characters long',
      'string.max': 'Street address cannot exceed 500 characters'
    }),

  country_id: Joi.number()
    .integer()
    .positive()
    .default(1)
    .optional()
    .messages({
      'number.base': 'Country ID must be a number',
      'number.integer': 'Country ID must be an integer',
      'number.positive': 'Country ID must be a positive number'
    }),

  state_id: Joi.number()
    .integer()
    .positive()
    .default(1)
    .optional()
    .messages({
      'number.base': 'State ID must be a number',
      'number.integer': 'State ID must be an integer',
      'number.positive': 'State ID must be a positive number'
    }),

  city_id: Joi.number()
    .integer()
    .positive()
    .default(1)
    .optional()
    .messages({
      'number.base': 'City ID must be a number',
      'number.integer': 'City ID must be an integer',
      'number.positive': 'City ID must be a positive number'
    }),

  event_category_tags_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Event Category Tags ID must be a number',
      'number.integer': 'Event Category Tags ID must be an integer',
      'number.positive': 'Event Category Tags ID must be a positive number'
    }),

  tags: Joi.array()
    .items(Joi.string().trim().max(50))
    .default([])
    .messages({
      'array.base': 'Tags must be an array'
    }),

  date: Joi.date()
    .required()
    .messages({
      'date.base': 'Date is required and must be a valid date'
    }),

  time: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Time is required'
    }),

  max_capacity: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Max capacity must be a number',
      'number.integer': 'Max capacity must be an integer',
      'number.min': 'Max capacity must be at least 1'
    }),

  event_image: Joi.string()
    .trim()
    .uri()
    .optional()
    .allow(null)
    .messages({
      'string.uri': 'Event image must be a valid URL'
    }),

  live_vibes_invite_videos: Joi.array()
    .items(Joi.string().trim().uri())
    .default([])
    .messages({
      'array.base': 'Live Vibes Invite Videos must be an array of URLs'
    }),

  live_vibes_invite_venue_tour: Joi.array()
    .items(Joi.string().trim().uri())
    .default([])
    .messages({
      'array.base': 'Live Vibes Invite Venue Tour must be an array of URLs'
    }),

  live_vibes_invite_music_preview: Joi.array()
    .items(Joi.string().trim().uri())
    .default([])
    .messages({
      'array.base': 'Live Vibes Invite Music Preview must be an array of URLs'
    }),

  live_vibes_invite_vip_perks: Joi.array()
    .items(Joi.string().trim().uri())
    .default([])
    .messages({
      'array.base': 'Live Vibes Invite VIP Perks must be an array of URLs'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

// Create event validation schema
const createEventSchema = Joi.object({
  name_title: commonValidations.name_title,
  event_type_id: commonValidations.event_type_id,
  ticketed_events: commonValidations.ticketed_events,
  description: commonValidations.description,
  venue_details_id: commonValidations.venue_details_id,
  street_address: commonValidations.street_address,
  country_id: commonValidations.country_id,
  state_id: commonValidations.state_id,
  city_id: commonValidations.city_id,
  event_category_tags_id: commonValidations.event_category_tags_id,
  tags: commonValidations.tags,
  date: commonValidations.date,
  time: commonValidations.time,
  max_capacity: commonValidations.max_capacity,
  event_image: commonValidations.event_image,
  live_vibes_invite_videos: commonValidations.live_vibes_invite_videos,
  live_vibes_invite_venue_tour: commonValidations.live_vibes_invite_venue_tour,
  live_vibes_invite_music_preview: commonValidations.live_vibes_invite_music_preview,
  live_vibes_invite_vip_perks: commonValidations.live_vibes_invite_vip_perks,
  status: commonValidations.status,
  ticketData: Joi.array()
    .items(Joi.object({
      ticket_type_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
          'number.base': 'Ticket type ID must be a number',
          'number.integer': 'Ticket type ID must be an integer',
          'number.positive': 'Ticket type ID must be a positive number',
          'any.required': 'Ticket type ID is required'
        }),
      ticket_query: Joi.string()
        .trim()
        .required()
        .messages({
          'string.empty': 'Ticket query is required',
          'any.required': 'Ticket query is required'
        }),
      price: Joi.number()
        .min(0)
        .required()
        .messages({
          'number.base': 'Price must be a number',
          'number.min': 'Price cannot be negative',
          'any.required': 'Price is required'
        })
    }))
    .optional()
    .messages({
      'array.base': 'Ticket data must be an array'
    })
}).unknown(true); // Allow other fields not explicitly defined

// Update event validation schema
const updateEventSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Event ID must be a number',
      'number.integer': 'Event ID must be an integer',
      'number.positive': 'Event ID must be a positive number',
      'any.required': 'Event ID is required'
    }),
  name_title: commonValidations.name_title.optional(),
  event_type_id: commonValidations.event_type_id.optional(),
  ticketed_events: commonValidations.ticketed_events.optional(),
  description: commonValidations.description.optional(),
  venue_details_id: commonValidations.venue_details_id.optional(),
  street_address: commonValidations.street_address.optional(),
  country_id: commonValidations.country_id.optional(),
  state_id: commonValidations.state_id.optional(),
  city_id: commonValidations.city_id.optional(),
  event_category_tags_id: commonValidations.event_category_tags_id.optional(),
  tags: commonValidations.tags.optional(),
  date: commonValidations.date.optional(),
  time: commonValidations.time.optional(),
  max_capacity: commonValidations.max_capacity.optional(),
  event_image: commonValidations.event_image.optional(),
  live_vibes_invite_videos: commonValidations.live_vibes_invite_videos.optional(),
  live_vibes_invite_venue_tour: commonValidations.live_vibes_invite_venue_tour.optional(),
  live_vibes_invite_music_preview: commonValidations.live_vibes_invite_music_preview.optional(),
  live_vibes_invite_vip_perks: commonValidations.live_vibes_invite_vip_perks.optional(),
  status: commonValidations.status.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Get event by ID validation schema
const getEventByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Event ID must be a number',
      'number.integer': 'Event ID must be an integer',
      'number.positive': 'Event ID must be a positive number'
    })
});

// Get all events query validation schema
const getAllEventsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  event_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Event Type ID must be a number',
      'number.integer': 'Event Type ID must be an integer',
      'number.positive': 'Event Type ID must be a positive number'
    }),
  country_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Country ID must be a number',
      'number.integer': 'Country ID must be an integer',
      'number.positive': 'Country ID must be a positive number'
    }),
  state_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'State ID must be a number',
      'number.integer': 'State ID must be an integer',
      'number.positive': 'State ID must be a positive number'
    }),
  city_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'City ID must be a number',
      'number.integer': 'City ID must be an integer',
      'number.positive': 'City ID must be a positive number'
    }),
  event_category_tags_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Event Category Tags ID must be a number',
      'number.integer': 'Event Category Tags ID must be an integer',
      'number.positive': 'Event Category Tags ID must be a positive number'
    }),
  ticketed_events: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Ticketed Events must be a boolean value'
    }),
  sortBy: Joi.string()
    .valid('name_title', 'date', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: name_title, date, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  getEventByIdSchema,
  getAllEventsSchema
};
