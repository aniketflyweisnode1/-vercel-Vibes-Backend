const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createEvent, 
  getAllEvents, 
  getEventById, 
  updateEvent,
  deleteEvent,
  getEventsByAuth,
  getEventsExcludingAuth,
  eventPayment
} = require('../../controllers/event.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createEventSchema, 
  updateEventSchema, 
  getEventByIdSchema, 
  getAllEventsSchema 
} = require('../../../validators/event.validator');

// Create event with auth
router.post('/create', auth, validateBody(createEventSchema), createEvent);

// Get all events with auth
router.get('/getAll', getAllEvents);

// Get events by authenticated user with auth
router.get('/getByAuth', auth, validateQuery(getAllEventsSchema), getEventsByAuth);

// Get all events excluding authenticated user's events with auth
router.get('/getExcludingAuth', auth, validateQuery(getAllEventsSchema), getEventsExcludingAuth);

// Get event by ID with auth
router.get('/getById/:id', auth, validateParams(getEventByIdSchema), getEventById);

// Update event by ID with auth
router.put('/updateById', auth, validateBody(updateEventSchema), updateEvent);

// Delete event by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getEventByIdSchema), deleteEvent);

// Create event payment intent (Stripe) and record transaction
router.post('/EventPayment', auth, eventPayment);

module.exports = router;
