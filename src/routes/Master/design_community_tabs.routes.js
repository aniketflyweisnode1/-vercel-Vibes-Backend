const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createDesignCommunityTab, 
  getAllDesignCommunityTabs, 
  getDesignCommunityTabById, 
  getDesignCommunityTabsByAuth, 
  updateDesignCommunityTab, 
  deleteDesignCommunityTab 
} = require('../../controllers/design_community_tabs.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createDesignCommunityTabSchema, 
  updateDesignCommunityTabSchema, 
  getDesignCommunityTabByIdSchema, 
  getAllDesignCommunityTabsSchema 
} = require('../../../validators/design_community_tabs.validator');

// Create design community tab (with auth)
router.post('/create', auth, validateBody(createDesignCommunityTabSchema), createDesignCommunityTab);

// Get all design community tabs (without auth)
router.get('/getAll', validateQuery(getAllDesignCommunityTabsSchema), getAllDesignCommunityTabs);

// Get design community tab by ID (with auth)
router.get('/getDesignCommunityTabById/:id', auth, validateParams(getDesignCommunityTabByIdSchema), getDesignCommunityTabById);

// Get design community tabs by authenticated user (with auth)
router.get('/getDesignCommunityTabsByAuth', auth, getDesignCommunityTabsByAuth);

// Update design community tab by ID (with auth)
router.put('/updateDesignCommunityTabById', auth, validateBody(updateDesignCommunityTabSchema), updateDesignCommunityTab);

// Delete design community tab by ID (with auth)
router.delete('/deleteDesignCommunityTabById/:id', auth, validateParams(getDesignCommunityTabByIdSchema), deleteDesignCommunityTab);

module.exports = router;

