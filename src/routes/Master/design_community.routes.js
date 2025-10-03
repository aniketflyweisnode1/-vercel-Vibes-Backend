const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createDesignCommunity, 
  getAllDesignCommunities, 
  getDesignCommunityById, 
  getDesignCommunitiesByAuth, 
  updateDesignCommunity, 
  deleteDesignCommunity 
} = require('../../controllers/design_community.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createDesignCommunitySchema, 
  updateDesignCommunitySchema, 
  getDesignCommunityByIdSchema, 
  getAllDesignCommunitiesSchema 
} = require('../../../validators/design_community.validator');

// Create design community (with auth)
router.post('/create', auth, validateBody(createDesignCommunitySchema), createDesignCommunity);

// Get all design communities (with auth)
router.get('/getAll', auth, validateQuery(getAllDesignCommunitiesSchema), getAllDesignCommunities);

// Get design community by ID (with auth)
router.get('/getDesignCommunityById/:id', auth, validateParams(getDesignCommunityByIdSchema), getDesignCommunityById);

// Get design communities by authenticated user (with auth)
router.get('/getDesignCommunitiesByAuth', auth, getDesignCommunitiesByAuth);

// Update design community by ID (with auth)
router.put('/updateDesignCommunityById', auth, validateBody(updateDesignCommunitySchema), updateDesignCommunity);

// Delete design community by ID (with auth)
router.delete('/deleteDesignCommunityById/:id', auth, validateParams(getDesignCommunityByIdSchema), deleteDesignCommunity);

module.exports = router;
