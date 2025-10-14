const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createCommunityDesignLike, 
  getAllCommunityDesignLikes, 
  getCommunityDesignLikeById, 
  updateCommunityDesignLike, 
  deleteCommunityDesignLike 
} = require('../../controllers/community_designs_likes.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createCommunityDesignLikeSchema, 
  updateCommunityDesignLikeSchema, 
  getCommunityDesignLikeByIdSchema, 
  getAllCommunityDesignLikesSchema 
} = require('../../../validators/community_designs_likes.validator');

// Create community design like (with auth)
router.post('/create', auth, validateBody(createCommunityDesignLikeSchema), createCommunityDesignLike);

// Get all community design likes (without auth)
router.get('/getAll', validateQuery(getAllCommunityDesignLikesSchema), getAllCommunityDesignLikes);

// Get community design like by ID (with auth)
router.get('/getCommunityDesignLikeById/:id', auth, validateParams(getCommunityDesignLikeByIdSchema), getCommunityDesignLikeById);

// Update community design like by ID (with auth)
router.put('/updateCommunityDesignLikeById', auth, validateBody(updateCommunityDesignLikeSchema), updateCommunityDesignLike);

// Delete community design like by ID (with auth)
router.delete('/deleteCommunityDesignLikeById/:id', auth, validateParams(getCommunityDesignLikeByIdSchema), deleteCommunityDesignLike);

module.exports = router;

