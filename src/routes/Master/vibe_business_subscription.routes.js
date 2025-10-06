const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createVibeBusinessSubscriptionSchema, updateVibeBusinessSubscriptionSchema, querySchema, idSchema } = require('../../../validators/vibe_business_subscription.validator');
const { createVibeBusinessSubscription, getAllVibeBusinessSubscriptions, getVibesBusinessSubscriptionById, updateVibeBusinessSubscription, deleteVibeBusinessSubscription } = require('../../controllers/vibe_business_subscription.controller');

// Create vibe business subscription (with auth)
router.post('/create', auth, validateBody(createVibeBusinessSubscriptionSchema), createVibeBusinessSubscription);

// Get all vibe business subscriptions (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllVibeBusinessSubscriptions);

// Get vibe business subscription by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getVibesBusinessSubscriptionById);

// Update vibe business subscription (with auth)
router.put('/update', auth, validateBody(updateVibeBusinessSubscriptionSchema), updateVibeBusinessSubscription);

// Delete vibe business subscription (with auth)
router.delete('/delete/:id', auth, deleteVibeBusinessSubscription);

module.exports = router;
