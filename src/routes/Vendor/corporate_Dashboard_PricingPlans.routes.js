const express = require('express');
const router = express.Router();

// Import controllers
const { createCorporateDashboardPricingPlans,
  getAllCorporateDashboardPricingPlans,
  getCorporateDashboardPricingPlansById,
  updateCorporateDashboardPricingPlans,
  deleteCorporateDashboardPricingPlans } = require('../../controllers/corporate_Dashboard_PricingPlans.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { createCorporateDashboardPricingPlansSchema,
  updateCorporateDashboardPricingPlansSchema,
  getCorporateDashboardPricingPlansByIdSchema,
  querySchema,
  deleteCorporateDashboardPricingPlansSchema } = require('../../../validators/corporate_Dashboard_PricingPlans.validator');

// Create corporate dashboard pricing plans (with auth)
router.post('/create', auth, validateBody(createCorporateDashboardPricingPlansSchema), createCorporateDashboardPricingPlans);

// Get all corporate dashboard pricing plans (with auth)
router.get('/getAll', auth, validateQuery(querySchema), getAllCorporateDashboardPricingPlans);

// Get corporate dashboard pricing plans by ID (with auth)
router.get('/getById/:id', auth, validateParams(getCorporateDashboardPricingPlansByIdSchema), getCorporateDashboardPricingPlansById);

// Update corporate dashboard pricing plans (with auth)
router.put('/update', auth, validateBody(updateCorporateDashboardPricingPlansSchema), updateCorporateDashboardPricingPlans);

// Delete corporate dashboard pricing plans (with auth)
router.delete('/delete/:id', auth, validateParams(deleteCorporateDashboardPricingPlansSchema), deleteCorporateDashboardPricingPlans);

module.exports = router;
