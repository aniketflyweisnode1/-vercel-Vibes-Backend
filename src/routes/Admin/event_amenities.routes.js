const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createEventAmenity, 
  getAllEventAmenities, 
  getEventAmenityById, 
  updateEventAmenity,
  deleteEventAmenity
} = require('../../controllers/event_amenities.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createEventAmenitySchema, 
  updateEventAmenitySchema, 
  getEventAmenityByIdSchema, 
  getAllEventAmenitiesSchema 
} = require('../../../validators/event_amenities.validator');

// Create event amenity with auth
router.post('/create', auth, validateBody(createEventAmenitySchema), createEventAmenity);

// Get all event amenities with auth
router.get('/getAll', auth, validateQuery(getAllEventAmenitiesSchema), getAllEventAmenities);

// Get event amenity by ID with auth
router.get('/getById/:id', auth, validateParams(getEventAmenityByIdSchema), getEventAmenityById);

// Update event amenity by ID with auth
router.put('/updateById', auth, validateBody(updateEventAmenitySchema), updateEventAmenity);

// Delete event amenity by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getEventAmenityByIdSchema), deleteEventAmenity);

module.exports = router;
