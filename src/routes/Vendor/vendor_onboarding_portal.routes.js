const express = require('express');
const router = express.Router();

// Import controllers
const {
  getAllVendorOnboardingPortals,
  getVendorOnboardingPortalById,
  updateVendorOnboardingPortal,
  deleteVendorOnboardingPortal,
  getVendorFullDetailsPublic,
  createVendorPortal
} = require('../../controllers/vendor_onboarding_portal.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const {
  updateVendorOnboardingPortalSchema,
  getVendorOnboardingPortalByIdSchema,
  querySchema,
  deleteVendorOnboardingPortalSchema,
  createVendorPortalSchema
} = require('../../../validators/vendor_onboarding_portal.validator');
// Create vendor portal (with auth)
router.post('/create', auth, validateBody(createVendorPortalSchema), createVendorPortal);

// Public vendor details (no auth)
router.get('/public/vendors', getVendorFullDetailsPublic);

// Get all vendor onboarding portals (with auth)
router.get('/getAll', auth, validateQuery(querySchema), getAllVendorOnboardingPortals);

// Get vendor onboarding portal by ID (with auth)
router.get('/getById/:id', auth, validateParams(getVendorOnboardingPortalByIdSchema), getVendorOnboardingPortalById);

// Update vendor onboarding portal (with auth)
router.put('/update', auth, validateBody(updateVendorOnboardingPortalSchema), updateVendorOnboardingPortal);

// Delete vendor onboarding portal (with auth)
router.delete('/delete/:id', auth, validateParams(deleteVendorOnboardingPortalSchema), deleteVendorOnboardingPortal);

module.exports = router;

