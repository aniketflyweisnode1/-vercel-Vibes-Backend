const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createFeatured, 
  getAllFeatured, 
  getFeaturedById, 
  updateFeatured, 
  updateFeaturedByIdBody, 
  deleteFeatured 
} = require('../../controllers/featured.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createFeaturedSchema, 
  updateFeaturedSchema, 
  updateFeaturedByIdBodySchema, 
  getFeaturedByIdSchema, 
  getAllFeaturedSchema 
} = require('../../../validators/featured.validator');

// Create featured with auth
router.post('/create', auth, validateBody(createFeaturedSchema), createFeatured);

// Get all featured with auth
router.get('/getAll', auth, validateQuery(getAllFeaturedSchema), getAllFeatured);

// Get featured by ID with auth
router.get('/getById/:id', auth, validateParams(getFeaturedByIdSchema), getFeaturedById);

// Update featured by ID with auth
router.put('/updateById', auth, validateBody(updateFeaturedByIdBodySchema), updateFeaturedByIdBody);

// Delete featured by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getFeaturedByIdSchema), deleteFeatured);

module.exports = router;
