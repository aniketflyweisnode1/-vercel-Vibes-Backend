const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createCommunityDesignShare, 
  getAllCommunityDesignShares, 
  getCommunityDesignShareById, 
  updateCommunityDesignShare, 
  deleteCommunityDesignShare 
} = require('../../controllers/community_designs_share.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createCommunityDesignShareSchema, 
  updateCommunityDesignShareSchema, 
  getCommunityDesignShareByIdSchema, 
  getAllCommunityDesignSharesSchema 
} = require('../../../validators/community_designs_share.validator');

// Create community design share (with auth)
router.post('/create', auth, validateBody(createCommunityDesignShareSchema), createCommunityDesignShare);

// Get all community design shares (without auth)
router.get('/getAll', validateQuery(getAllCommunityDesignSharesSchema), getAllCommunityDesignShares);

// Get community design share by ID (with auth)
router.get('/getCommunityDesignShareById/:id', auth, validateParams(getCommunityDesignShareByIdSchema), getCommunityDesignShareById);

// Update community design share by ID (with auth)
router.put('/updateCommunityDesignShareById', auth, validateBody(updateCommunityDesignShareSchema), updateCommunityDesignShare);

// Delete community design share by ID (with auth)
router.delete('/deleteCommunityDesignShareById/:id', auth, validateParams(getCommunityDesignShareByIdSchema), deleteCommunityDesignShare);

module.exports = router;

