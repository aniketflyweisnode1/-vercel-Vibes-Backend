const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createEvent, 
  getAllEvents, 
  getEventById, 
  updateEvent,
  deleteEvent,
  getEventsByAuth
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

// Get event by ID with auth
router.get('/getById/:id', auth, validateParams(getEventByIdSchema), getEventById);

// Update event by ID with auth
router.put('/updateById', auth, validateBody(updateEventSchema), updateEvent);

// Delete event by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getEventByIdSchema), deleteEvent);

module.exports = router;
