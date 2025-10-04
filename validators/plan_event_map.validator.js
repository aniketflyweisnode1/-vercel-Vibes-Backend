const Joi = require('joi');

// Validation schema for setup requirements
const setupRequirementSchema = Joi.object({
  setup_requirements_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Setup requirements ID must be a number',
    'number.integer': 'Setup requirements ID must be an integer',
    'number.min': 'Setup requirements ID must be greater than 0',
    'any.required': 'Setup requirements ID is required'
  }),
  setup_status: Joi.string().valid('Pending', 'In Progress', 'Confirmed', 'Completed').default('Pending').messages({
    'any.only': 'Setup status must be one of: Pending, In Progress, Confirmed, Completed'
  })
});

// Validation schema for venue management
const venueManagementSchema = Joi.object({
  venue_details: Joi.number().integer().min(1).messages({
    'number.base': 'Venue details ID must be a number',
    'number.integer': 'Venue details ID must be an integer',
    'number.min': 'Venue details ID must be greater than 0'
  }),
  amenities_id: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Amenities ID must be a number',
      'number.integer': 'Amenities ID must be an integer',
      'number.min': 'Amenities ID must be greater than 0'
    })
  ).default([]),
  setup_requirements: Joi.array().items(setupRequirementSchema).default([])
});

// Validation schema for guest invitation
const guestInvitationSchema = Joi.object({
  guest_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Guest ID must be a number',
    'number.integer': 'Guest ID must be an integer',
    'number.min': 'Guest ID must be greater than 0',
    'any.required': 'Guest ID is required'
  }),
  invite_status: Joi.string().valid('Confirmed', 'Pending', 'Declined', 'Maybe').default('Pending').messages({
    'any.only': 'Invite status must be one of: Confirmed, Pending, Declined, Maybe'
  })
});

// Validation schema for creating plan event map
const createPlanEventMapSchema = Joi.object({
  event_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0',
    'any.required': 'Event ID is required'
  }),
  menu_drinks: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Drink ID must be a number',
      'number.integer': 'Drink ID must be an integer',
      'number.min': 'Drink ID must be greater than 0'
    })
  ).default([]),
  menu_food: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Food ID must be a number',
      'number.integer': 'Food ID must be an integer',
      'number.min': 'Food ID must be greater than 0'
    })
  ).default([]),
  menu_entertainment: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Entertainment ID must be a number',
      'number.integer': 'Entertainment ID must be an integer',
      'number.min': 'Entertainment ID must be greater than 0'
    })
  ).default([]),
  menu_decorations: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Decorations ID must be a number',
      'number.integer': 'Decorations ID must be an integer',
      'number.min': 'Decorations ID must be greater than 0'
    })
  ).default([]),
  tasks: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Task ID must be a number',
      'number.integer': 'Task ID must be an integer',
      'number.min': 'Task ID must be greater than 0'
    })
  ).default([]),
  chat: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Chat ID must be a number',
      'number.integer': 'Chat ID must be an integer',
      'number.min': 'Chat ID must be greater than 0'
    })
  ).default([]),
  budget_items_id: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Budget item ID must be a number',
      'number.integer': 'Budget item ID must be an integer',
      'number.min': 'Budget item ID must be greater than 0'
    })
  ).default([]),
  venue_management: venueManagementSchema.default({}),
  event_gallery: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Event gallery ID must be a number',
      'number.integer': 'Event gallery ID must be an integer',
      'number.min': 'Event gallery ID must be greater than 0'
    })
  ).default([]),
  guests_id: Joi.array().items(guestInvitationSchema).default([]),
  // Transaction fields (optional - will be auto-created if not provided)
  amount: Joi.number().min(0).messages({
    'number.base': 'Amount must be a number',
    'number.min': 'Amount cannot be negative'
  }),
  payment_method_id: Joi.number().integer().min(1).messages({
    'number.base': 'Payment method ID must be a number',
    'number.integer': 'Payment method ID must be an integer',
    'number.min': 'Payment method ID must be greater than 0'
  }),
  status: Joi.boolean().default(true)
});

// Validation schema for updating plan event map
const updatePlanEventMapSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  }),
  event_id: Joi.number().integer().min(1).messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0'
  }),
  menu_drinks: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Drink ID must be a number',
      'number.integer': 'Drink ID must be an integer',
      'number.min': 'Drink ID must be greater than 0'
    })
  ),
  menu_food: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Food ID must be a number',
      'number.integer': 'Food ID must be an integer',
      'number.min': 'Food ID must be greater than 0'
    })
  ),
  menu_entertainment: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Entertainment ID must be a number',
      'number.integer': 'Entertainment ID must be an integer',
      'number.min': 'Entertainment ID must be greater than 0'
    })
  ),
  menu_decorations: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Decorations ID must be a number',
      'number.integer': 'Decorations ID must be an integer',
      'number.min': 'Decorations ID must be greater than 0'
    })
  ),
  tasks: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Task ID must be a number',
      'number.integer': 'Task ID must be an integer',
      'number.min': 'Task ID must be greater than 0'
    })
  ),
  chat: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Chat ID must be a number',
      'number.integer': 'Chat ID must be an integer',
      'number.min': 'Chat ID must be greater than 0'
    })
  ),
  budget_items_id: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Budget item ID must be a number',
      'number.integer': 'Budget item ID must be an integer',
      'number.min': 'Budget item ID must be greater than 0'
    })
  ),
  venue_management: venueManagementSchema,
  event_gallery: Joi.array().items(
    Joi.number().integer().min(1).messages({
      'number.base': 'Event gallery ID must be a number',
      'number.integer': 'Event gallery ID must be an integer',
      'number.min': 'Event gallery ID must be greater than 0'
    })
  ),
  guests_id: Joi.array().items(guestInvitationSchema),
  status: Joi.boolean()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation schema for query parameters
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(255).allow(''),
  status: Joi.string().valid('true', 'false').allow(''),
  event_id: Joi.number().integer().min(1).allow('').messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0'
  })
});

// Validation schema for ID parameter
const idSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
    'number.min': 'ID must be greater than 0',
    'any.required': 'ID is required'
  })
});

// Validation schema for event ID parameter
const eventIdSchema = Joi.object({
  eventId: Joi.number().integer().min(1).required().messages({
    'number.base': 'Event ID must be a number',
    'number.integer': 'Event ID must be an integer',
    'number.min': 'Event ID must be greater than 0',
    'any.required': 'Event ID is required'
  })
});

// Validation schema for update event payment
const updateEventPaymentSchema = Joi.object({
  transaction_id: Joi.number().integer().min(1).required().messages({
    'number.base': 'Transaction ID must be a number',
    'number.integer': 'Transaction ID must be an integer',
    'number.min': 'Transaction ID must be greater than 0',
    'any.required': 'Transaction ID is required'
  })
});

module.exports = {
  createPlanEventMapSchema,
  updatePlanEventMapSchema,
  updateEventPaymentSchema,
  querySchema,
  idSchema,
  eventIdSchema
};
