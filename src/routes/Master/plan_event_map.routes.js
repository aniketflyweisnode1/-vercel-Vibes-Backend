const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createPlanEventMapSchema, updatePlanEventMapSchema, updateEventPaymentSchema, querySchema, idSchema, eventIdSchema } = require('../../../validators/plan_event_map.validator');
const { createPlanEventMap, getAllPlanEventMaps, getPlanEventMapById, getPlanEventMapsByAuth, getPlanEventMapsByEventId, updatePlanEventMap, updateEventPayment, deletePlanEventMap } = require('../../controllers/plan_event_map.controller');

// Create plan event map (with auth)
router.post('/create', auth, validateBody(createPlanEventMapSchema), createPlanEventMap);

// Get all plan event maps (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllPlanEventMaps);

// Get plan event maps by authenticated user (with auth)
router.get('/my-plans', auth, validateQuery(querySchema), getPlanEventMapsByAuth);

// Get plan event maps by event ID (with auth)
router.get('/event/:eventId', auth, validateParams(eventIdSchema), validateQuery(querySchema), getPlanEventMapsByEventId);

// Get plan event map by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getPlanEventMapById);

// Update plan event map (with auth)
router.put('/update', auth, validateBody(updatePlanEventMapSchema), updatePlanEventMap);

// Update event payment status (with auth)
router.put('/update-event-payment', auth, validateBody(updateEventPaymentSchema), updateEventPayment);

// Delete plan event map (with auth)
router.delete('/delete/:id', auth, validateParams(idSchema), deletePlanEventMap);

module.exports = router;
