const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createVibeBusinessPlanSubscribedSchema, updateVibeBusinessPlanSubscribedSchema, updateAfterTransactionSchema, querySchema, idSchema } = require('../../../validators/vibe_business_plan_subscribed.validator');
const { createVibeBusinessPlanSubscribed, getAllVibeBusinessPlansSubscribed, getVibeBusinessPlanSubscribedById, updateVibeBusinessPlanSubscribed, updateAfterTransaction, deleteVibeBusinessPlanSubscribed, getByAuthPlanSubscribed } = require('../../controllers/vibe_business_plan_subscribed.controller');

// Create vibe business plan subscribed (with auth)
router.post('/create', auth, validateBody(createVibeBusinessPlanSubscribedSchema), createVibeBusinessPlanSubscribed);

// Get all vibe business plans subscribed (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllVibeBusinessPlansSubscribed);

// Get vibe business plan subscribed by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getVibeBusinessPlanSubscribedById);

// Get vibe business plan subscribed by authenticated user (with auth)
router.get('/getByAuth', auth, validateQuery(querySchema), getByAuthPlanSubscribed);

// Update vibe business plan subscribed (with auth)
router.put('/update', auth, validateBody(updateVibeBusinessPlanSubscribedSchema), updateVibeBusinessPlanSubscribed);

// Update vibe business plan subscribed after transaction completion (with auth)
router.put('/update-after-transaction', auth, validateBody(updateAfterTransactionSchema), updateAfterTransaction);

// Delete vibe business plan subscribed (with auth)
router.delete('/delete/:id', auth, deleteVibeBusinessPlanSubscribed);

module.exports = router;
