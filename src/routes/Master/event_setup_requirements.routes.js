const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createEventSetupRequirementSchema, updateEventSetupRequirementSchema, querySchema, idSchema } = require('../../../validators/event_setup_requirements.validator');
const { createEventSetupRequirement, getAllEventSetupRequirements, getEventSetupRequirementById, getEventSetupRequirementsByAuth, updateEventSetupRequirement, deleteEventSetupRequirement } = require('../../controllers/event_setup_requirements.controller');

// Create event setup requirement (with auth)
router.post('/create', auth, validateBody(createEventSetupRequirementSchema), createEventSetupRequirement);

// Get all event setup requirements (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllEventSetupRequirements);

// Get event setup requirements by authenticated user (with auth)
router.get('/my-requirements', auth, validateQuery(querySchema), getEventSetupRequirementsByAuth);

// Get event setup requirement by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getEventSetupRequirementById);

// Update event setup requirement (with auth)
router.put('/update/:id', auth, validateParams(idSchema), validateBody(updateEventSetupRequirementSchema), updateEventSetupRequirement);

// Delete event setup requirement (with auth)
router.delete('/delete/:id', auth, validateParams(idSchema), deleteEventSetupRequirement);

module.exports = router;
