const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createEventTicketSeatSchema, updateEventTicketSeatSchema, querySchema, idSchema } = require('../../../validators/event_tickets_seats.validator');
const { createEventTicketSeat, getAllEventTicketsSeats, getEventTicketSeatById, updateEventTicketSeat, deleteEventTicketSeat } = require('../../controllers/event_tickets_seats.controller');

// Create event ticket seat (with auth)
router.post('/create', auth, validateBody(createEventTicketSeatSchema), createEventTicketSeat);

// Get all event ticket seats (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllEventTicketsSeats);

// Get event ticket seat by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getEventTicketSeatById);

// Update event ticket seat (with auth)
router.put('/update', auth, validateBody(updateEventTicketSeatSchema), updateEventTicketSeat);

// Delete event ticket seat (with auth)
router.delete('/delete/:id', auth, validateParams(idSchema), deleteEventTicketSeat);

module.exports = router;

