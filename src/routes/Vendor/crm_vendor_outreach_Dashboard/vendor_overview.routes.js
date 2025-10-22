const express = require('express');
const router = express.Router();

// Import controllers
const { 
  getVendorLeadsOverview,
  getPipelineOverview,
  getRecentOutreachActivities,
  getUpcomingFollowUps
} = require('../../../controllers/vendor_overview.controller'); 

// Import middleware
const { auth } = require('../../../../middleware/auth');

// Get vendor leads overview with auth
router.get('/overview', auth, getVendorLeadsOverview);

// Get pipeline overview with auth
router.get('/pipeline-overview', auth, getPipelineOverview);

// Get recent outreach activities with auth
router.get('/recent-activities', auth, getRecentOutreachActivities);

// Get upcoming follow-ups with auth
router.get('/upcoming-followups', auth, getUpcomingFollowUps);

module.exports = router;
