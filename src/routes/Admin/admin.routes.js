const express = require('express');
const router = express.Router();

// Import controllers
const { adminLogin, getAdminProfile } = require('../../controllers/admin.controller');

// Import middleware
const { auth, authRateLimit } = require('../../../middleware/auth');
const { validateBody } = require('../../../middleware/validation');

// Import validators
const { adminLoginSchema } = require('../../../validators/admin.validator');

// Admin login route (no OTP, just email and password)
router.post('/login', validateBody(adminLoginSchema), adminLogin);

// Get admin profile (protected route)
router.get('/profile', auth, getAdminProfile);

module.exports = router;

