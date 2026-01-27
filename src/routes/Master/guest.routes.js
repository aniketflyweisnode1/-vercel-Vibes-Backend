const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createGuestSchema, updateGuestSchema, querySchema, idSchema, eventIdSchema } = require('../../../validators/guest.validator');
const { createGuest, getAllGuests, getGuestById, getGuestsByAuth, getGuestsByEventId, updateGuest, deleteGuest, getGuestCountsByEventId } = require('../../controllers/guest.controller');

// Create guest (with auth)
router.post('/create', auth, validateBody(createGuestSchema), createGuest);

// Get all guests (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllGuests);

// Get guests by authenticated user (with auth)
router.get('/my-guests', auth, validateQuery(querySchema), getGuestsByAuth);

// Get guests by event ID (with auth)
router.get('/event/:eventId', auth, validateParams(eventIdSchema), validateQuery(querySchema), getGuestsByEventId);

// Get guest by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getGuestById);

// Update guest (with auth)
router.put('/update', auth, validateBody(updateGuestSchema), updateGuest);

// Delete guest (with auth)
router.delete('/delete/:id', auth, deleteGuest);

router.get('/getGuestCountsByEventId/:eventId', auth, getGuestCountsByEventId);
module.exports = router;
