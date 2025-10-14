const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createCommunityDesign, 
  getAllCommunityDesigns, 
  getCommunityDesignById, 
  getCommunityDesignsByCategoryId,
  updateCommunityDesign, 
  deleteCommunityDesign 
} = require('../../controllers/community_designs.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createCommunityDesignSchema, 
  updateCommunityDesignSchema, 
  getCommunityDesignByIdSchema, 
  getAllCommunityDesignsSchema 
} = require('../../../validators/community_designs.validator');

// Create community design (with auth)
router.post('/create', auth, validateBody(createCommunityDesignSchema), createCommunityDesign);

// Get all community designs (without auth)
router.get('/getAll', validateQuery(getAllCommunityDesignsSchema), getAllCommunityDesigns);

// Get community design by ID (with auth)
router.get('/getCommunityDesignById/:id', auth, validateParams(getCommunityDesignByIdSchema), getCommunityDesignById);

// Get community designs by category ID (without auth)
router.get('/getCommunityDesignsByCategoryId/:id', validateParams(getCommunityDesignByIdSchema), validateQuery(getAllCommunityDesignsSchema), getCommunityDesignsByCategoryId);

// Update community design by ID (with auth)
router.put('/updateCommunityDesignById', auth, validateBody(updateCommunityDesignSchema), updateCommunityDesign);

// Delete community design by ID (with auth)
router.delete('/deleteCommunityDesignById/:id', auth, validateParams(getCommunityDesignByIdSchema), deleteCommunityDesign);

module.exports = router;

