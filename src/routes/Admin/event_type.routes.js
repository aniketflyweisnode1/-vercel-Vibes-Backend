const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createEventType, 
  getAllEventTypes, 
  getEventTypeById, 
  updateEventType, 
  updateEventTypeByIdBody, 
  deleteEventType, 
  getEventTypesByAuth 
} = require('../../controllers/event_type.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createEventTypeSchema, 
  updateEventTypeSchema, 
  updateEventTypeByIdBodySchema, 
  getEventTypeByIdSchema, 
  getAllEventTypesSchema 
} = require('../../../validators/event_type.validator');

// Create event type with auth
router.post('/create', auth, validateBody(createEventTypeSchema), createEventType);

// Get all event types with auth
router.get('/getAll',  getAllEventTypes);

// Get event types by authenticated user with auth
router.get('/getByAuth', auth, validateQuery(getAllEventTypesSchema), getEventTypesByAuth);

// Get event type by ID with auth
router.get('/getById/:id', auth, validateParams(getEventTypeByIdSchema), getEventTypeById);

// Update event type by ID with auth
router.put('/updateById', auth, validateBody(updateEventTypeByIdBodySchema), updateEventTypeByIdBody);

// Delete event type by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getEventTypeByIdSchema), deleteEventType);

module.exports = router;
