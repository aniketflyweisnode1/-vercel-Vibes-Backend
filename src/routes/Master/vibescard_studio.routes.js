const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createVibesCardStudioSchema, updateVibesCardStudioSchema, querySchema, idSchema, eventIdSchema } = require('../../../validators/vibescard_studio.validator');
const { createVibesCardStudio, getAllVibesCardStudios, getVibesCardStudioById, getVibesCardStudiosByEventId, updateVibesCardStudio, deleteVibesCardStudio } = require('../../controllers/vibescard_studio.controller');

// Create vibes card studio (with auth)
router.post('/create', auth, validateBody(createVibesCardStudioSchema), createVibesCardStudio);

// Get all vibes card studios (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllVibesCardStudios);

// Get vibes card studios by event ID (with auth)
router.get('/event/:eventId', auth, validateParams(eventIdSchema), validateQuery(querySchema), getVibesCardStudiosByEventId);

// Get vibes card studio by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getVibesCardStudioById);

// Update vibes card studio (with auth)
router.put('/update', auth, validateBody(updateVibesCardStudioSchema), updateVibesCardStudio);

// Delete vibes card studio (with auth)
router.delete('/delete/:id', auth, deleteVibesCardStudio);

module.exports = router;
