const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createEventEntryUsergetTicketSchema, updateEventEntryUsergetTicketSchema, querySchema, idSchema, eventIdSchema } = require('../../../validators/event_entry_userget_tickets.validator');
const { createEventEntryUsergetTicket, getAllEventEntryUsergetTickets, getEventEntryUsergetTicketById, getEventEntryUsergetTicketsByEventId, updateEventEntryUsergetTicket, deleteEventEntryUsergetTicket } = require('../../controllers/event_entry_userget_tickets.controller');

// Create event entry userget ticket (with auth)
router.post('/create', auth, validateBody(createEventEntryUsergetTicketSchema), createEventEntryUsergetTicket);

// Get all event entry userget tickets (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllEventEntryUsergetTickets);

// Get event entry userget tickets by event ID (with auth)
router.get('/event/:eventId', auth, validateParams(eventIdSchema), validateQuery(querySchema), getEventEntryUsergetTicketsByEventId);

// Get event entry userget ticket by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getEventEntryUsergetTicketById);

// Update event entry userget ticket (with auth)
router.put('/update', auth, validateBody(updateEventEntryUsergetTicketSchema), updateEventEntryUsergetTicket);

// Delete event entry userget ticket (with auth)
router.delete('/delete/:id', auth, validateParams(idSchema), deleteEventEntryUsergetTicket);

module.exports = router;

