const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createEventEntryTicketSchema, updateEventEntryTicketSchema, querySchema, idSchema } = require('../../../validators/event_entry_tickets.validator');
const { createEventEntryTicket, getAllEventEntryTickets, getEventEntryTicketById, getEventEntryTicketsByAuth, updateEventEntryTicket, deleteEventEntryTicket } = require('../../controllers/event_entry_tickets.controller');

// Create event entry ticket (with auth)
router.post('/create', auth, validateBody(createEventEntryTicketSchema), createEventEntryTicket);

// Get all event entry tickets (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllEventEntryTickets);

// Get event entry tickets by authenticated user (with auth)
router.get('/my-tickets', auth, validateQuery(querySchema), getEventEntryTicketsByAuth);

// Get event entry ticket by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getEventEntryTicketById);

// Update event entry ticket (with auth)
router.put('/update', auth, validateBody(updateEventEntryTicketSchema), updateEventEntryTicket);

// Delete event entry ticket (with auth)
router.delete('/delete/:id', auth, validateParams(idSchema), deleteEventEntryTicket);

module.exports = router;

