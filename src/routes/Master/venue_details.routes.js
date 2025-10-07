const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createVenueDetailsSchema, updateVenueDetailsSchema, querySchema, idSchema, eventIdSchema } = require('../../../validators/venue_details.validator');
const { createVenueDetails, getAllVenueDetails, getVenueDetailsById, updateVenueDetails, deleteVenueDetails, getVenueDetailsByEventId } = require('../../controllers/venue_details.controller');

// Create venue details (with auth)
router.post('/create', auth, validateBody(createVenueDetailsSchema), createVenueDetails);

// Get all venue details (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllVenueDetails);

// Get venue details by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getVenueDetailsById);

// Get venue details by event ID (with auth)
router.get('/event/:eventId', auth, validateParams(eventIdSchema), getVenueDetailsByEventId);

// Update venue details (with auth)
router.put('/update', auth, validateBody(updateVenueDetailsSchema), updateVenueDetails);

// Delete venue details (with auth)
router.delete('/delete/:id', auth, deleteVenueDetails);

module.exports = router;
