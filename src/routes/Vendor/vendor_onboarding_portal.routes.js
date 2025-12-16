const express = require('express');
const router = express.Router();

// Import controllers
const {
  getAllVendorOnboardingPortals,
  getVendorOnboardingPortalById,
  updateVendorOnboardingPortal,
  deleteVendorOnboardingPortal,
  getVendorFullDetailsPublic,
  createVendorPortal,
  findVendorbyCategoryfeePrice
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
  createVendorPortalSchema,
  findVendorbyCategoryfeePriceSchema
} = require('../../../validators/vendor_onboarding_portal.validator');
// Create vendor portal (with auth)
router.post('/create', auth, validateBody(createVendorPortalSchema), createVendorPortal);

// Public vendor details (no auth)
router.get('/public/vendors', getVendorFullDetailsPublic);

// Find vendors by category fee price with location (no auth)
router.get('/findVendorbyCategoryfeePrice', validateQuery(findVendorbyCategoryfeePriceSchema), findVendorbyCategoryfeePrice);

// Get all vendor onboarding portals (with auth)
router.get('/getAll', auth, validateQuery(querySchema), getAllVendorOnboardingPortals);

// Get vendor onboarding portal by ID (with auth)
router.get('/getById/:id', auth, validateParams(getVendorOnboardingPortalByIdSchema), getVendorOnboardingPortalById);

// Update vendor onboarding portal (with auth)
router.put('/update', auth, validateBody(updateVendorOnboardingPortalSchema), updateVendorOnboardingPortal);

// Delete vendor onboarding portal (with auth)
router.delete('/delete/:id', auth, validateParams(deleteVendorOnboardingPortalSchema), deleteVendorOnboardingPortal);


module.exports = router;

