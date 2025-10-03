const express = require('express');
const router = express.Router();

const { 
  createEventGallery, 
  getAllEventGallery, 
  getEventGalleryById, 
  getEventGalleryByAuth, 
  updateEventGallery, 
  deleteEventGallery 
} = require('../../controllers/event_gallery.controller');

const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { 
  createEventGallerySchema, 
  updateEventGallerySchema, 
  getEventGalleryByIdSchema, 
  getAllEventGallerySchema 
} = require('../../../validators/event_gallery.validator');

// Create event gallery (with auth)
router.post('/create', auth, validateBody(createEventGallerySchema), createEventGallery);

// Get all event galleries
router.get('/getAll', validateQuery(getAllEventGallerySchema), getAllEventGallery);

// Get event gallery by ID (with auth)
router.get('/getEventGalleryById/:id', auth, validateParams(getEventGalleryByIdSchema), getEventGalleryById);

// Get event gallery by authenticated user (with auth)
router.get('/getEventGalleryByAuth', auth, getEventGalleryByAuth);

// Update event gallery by ID (with auth)
router.put('/updateEventGalleryById', auth, validateBody(updateEventGallerySchema), updateEventGallery);

// Delete event gallery by ID (with auth)
router.delete('/deleteEventGalleryById/:id', auth, validateParams(getEventGalleryByIdSchema), deleteEventGallery);

module.exports = router;

