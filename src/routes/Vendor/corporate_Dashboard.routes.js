const express = require('express');
const router = express.Router();

// Import controllers
const { getCorporateDashboard, getCorporateDashboardClients } = require('../../controllers/corporate_Dashboard.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateQuery } = require('../../../middleware/validation');

// Import validators
const { getCorporateDashboardClientsSchema } = require('../../../validators/corporate_Dashboard.validator');

// Get corporate dashboard analytics (with auth)
router.get('/', auth, getCorporateDashboard);

// Get corporate dashboard clients (with auth)
router.get('/clients', auth, validateQuery(getCorporateDashboardClientsSchema), getCorporateDashboardClients);

module.exports = router;
