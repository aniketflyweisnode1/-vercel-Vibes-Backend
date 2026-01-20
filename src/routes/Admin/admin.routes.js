const express = require('express');
const router = express.Router();
// Import controllers
const { adminLogin, getAdminProfile, getAdminDashboard } = require('../../controllers/admin.controller');
// Import middleware
const { auth, authRateLimit } = require('../../../middleware/auth');
const { validateBody } = require('../../../middleware/validation');
// Import validators
const { adminLoginSchema } = require('../../../validators/admin.validator');
// Admin login route (no OTP, just email and password)
router.post('/login', validateBody(adminLoginSchema), adminLogin);
// Get admin profile (protected route)
router.get('/profile', auth, getAdminProfile);
router.get('/getAdminDashboard', getAdminDashboard);

module.exports = router;

