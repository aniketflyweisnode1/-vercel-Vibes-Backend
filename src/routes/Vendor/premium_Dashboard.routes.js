const express = require('express');
const router = express.Router();

// Import controllers
const { getPremiumDashboard, getPremiumDashboardEvents } = require('../../controllers/premium_Dashboard.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateQuery } = require('../../../middleware/validation');

// Import validators
const { getPremiumDashboardEventsSchema } = require('../../../validators/premium_Dashboard.validator');

// Get premium dashboard analytics (with auth)
router.get('/', auth, getPremiumDashboard);

// Get premium dashboard events (with auth)
router.get('/events', auth, validateQuery(getPremiumDashboardEventsSchema), getPremiumDashboardEvents);

module.exports = router;
