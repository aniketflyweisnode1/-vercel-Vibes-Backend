const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createCommunityDesignView, 
  getAllCommunityDesignViews, 
  getCommunityDesignViewById, 
  updateCommunityDesignView, 
  deleteCommunityDesignView 
} = require('../../controllers/community_designs_views.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createCommunityDesignViewSchema, 
  updateCommunityDesignViewSchema, 
  getCommunityDesignViewByIdSchema, 
  getAllCommunityDesignViewsSchema 
} = require('../../../validators/community_designs_views.validator');

// Create community design view (with auth)
router.post('/create', auth, validateBody(createCommunityDesignViewSchema), createCommunityDesignView);

// Get all community design views (without auth)
router.get('/getAll', validateQuery(getAllCommunityDesignViewsSchema), getAllCommunityDesignViews);

// Get community design view by ID (with auth)
router.get('/getCommunityDesignViewById/:id', auth, validateParams(getCommunityDesignViewByIdSchema), getCommunityDesignViewById);

// Update community design view by ID (with auth)
router.put('/updateCommunityDesignViewById', auth, validateBody(updateCommunityDesignViewSchema), updateCommunityDesignView);

// Delete community design view by ID (with auth)
router.delete('/deleteCommunityDesignViewById/:id', auth, validateParams(getCommunityDesignViewByIdSchema), deleteCommunityDesignView);

module.exports = router;

