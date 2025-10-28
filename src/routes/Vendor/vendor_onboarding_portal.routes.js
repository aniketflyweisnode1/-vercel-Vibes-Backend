const express = require('express');
const router = express.Router();

// Import controllers
const {
  createVendorOnboardingPortal,
  getAllVendorOnboardingPortals,
  getVendorOnboardingPortalById,
  updateVendorOnboardingPortal,
  deleteVendorOnboardingPortal
} = require('../../controllers/vendor_onboarding_portal.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const {
  createVendorOnboardingPortalSchema,
  updateVendorOnboardingPortalSchema,
  getVendorOnboardingPortalByIdSchema,
  querySchema,
  deleteVendorOnboardingPortalSchema
} = require('../../../validators/vendor_onboarding_portal.validator');

// Create vendor onboarding portal (with auth)
router.post('/create', auth, validateBody(createVendorOnboardingPortalSchema), createVendorOnboardingPortal);

// Get all vendor onboarding portals (with auth)
router.get('/getAll', auth, validateQuery(querySchema), getAllVendorOnboardingPortals);

// Get vendor onboarding portal by ID (with auth)
router.get('/getById/:id', auth, validateParams(getVendorOnboardingPortalByIdSchema), getVendorOnboardingPortalById);

// Update vendor onboarding portal (with auth)
router.put('/update', auth, validateBody(updateVendorOnboardingPortalSchema), updateVendorOnboardingPortal);

// Delete vendor onboarding portal (with auth)
router.delete('/delete/:id', auth, validateParams(deleteVendorOnboardingPortalSchema), deleteVendorOnboardingPortal);

module.exports = router;

