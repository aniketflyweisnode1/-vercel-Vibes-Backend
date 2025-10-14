const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createCommunityDesignRemix, 
  getAllCommunityDesignRemixes, 
  getCommunityDesignRemixById, 
  updateCommunityDesignRemix, 
  deleteCommunityDesignRemix 
} = require('../../controllers/community_designs_remixes.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createCommunityDesignRemixSchema, 
  updateCommunityDesignRemixSchema, 
  getCommunityDesignRemixByIdSchema, 
  getAllCommunityDesignRemixesSchema 
} = require('../../../validators/community_designs_remixes.validator');

// Create community design remix (with auth)
router.post('/create', auth, validateBody(createCommunityDesignRemixSchema), createCommunityDesignRemix);

// Get all community design remixes (without auth)
router.get('/getAll', validateQuery(getAllCommunityDesignRemixesSchema), getAllCommunityDesignRemixes);

// Get community design remix by ID (with auth)
router.get('/getCommunityDesignRemixById/:id', auth, validateParams(getCommunityDesignRemixByIdSchema), getCommunityDesignRemixById);

// Update community design remix by ID (with auth)
router.put('/updateCommunityDesignRemixById', auth, validateBody(updateCommunityDesignRemixSchema), updateCommunityDesignRemix);

// Delete community design remix by ID (with auth)
router.delete('/deleteCommunityDesignRemixById/:id', auth, validateParams(getCommunityDesignRemixByIdSchema), deleteCommunityDesignRemix);

module.exports = router;

