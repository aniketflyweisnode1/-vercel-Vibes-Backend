const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createOnboardingStarted, 
  getAllOnboardingStarted, 
  getOnboardingStartedById, 
  updateOnboardingStarted, 
  updateOnboardingStartedByIdBody, 
  deleteOnboardingStarted 
} = require('../../controllers/onboarding_started.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createOnboardingStartedSchema, 
  updateOnboardingStartedSchema, 
  updateOnboardingStartedByIdBodySchema, 
  getOnboardingStartedByIdSchema, 
  getAllOnboardingStartedSchema 
} = require('../../../validators/onboarding_started.validator');

// Create onboarding started with auth
router.post('/create', auth, validateBody(createOnboardingStartedSchema), createOnboardingStarted);

// Get all onboarding started with auth
router.get('/getAll', auth, validateQuery(getAllOnboardingStartedSchema), getAllOnboardingStarted);

// Get onboarding started by ID with auth
router.get('/getById/:id', auth, validateParams(getOnboardingStartedByIdSchema), getOnboardingStartedById);

// Update onboarding started by ID with auth
router.put('/updateById', auth, validateBody(updateOnboardingStartedByIdBodySchema), updateOnboardingStartedByIdBody);

// Delete onboarding started by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getOnboardingStartedByIdSchema), deleteOnboardingStarted);

module.exports = router;
