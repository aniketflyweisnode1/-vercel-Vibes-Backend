const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createCateringMarketplace, 
  getAllCateringMarketplaces, 
  getCateringMarketplaceById, 
  updateCateringMarketplace, 
  deleteCateringMarketplace
} = require('../../controllers/catering_marketplace.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createCateringMarketplaceSchema, 
  updateCateringMarketplaceSchema, 
  getCateringMarketplaceByIdSchema
} = require('../../../validators/catering_marketplace.validator');

// Create catering marketplace with auth (auto-increments review_count by 1)
router.post('/create', auth, validateBody(createCateringMarketplaceSchema), createCateringMarketplace);

// Get all catering marketplaces (no auth, no validation)
router.get('/getAll', getAllCateringMarketplaces);

// Get catering marketplace by ID with auth
router.get('/getById/:id', auth, validateParams(getCateringMarketplaceByIdSchema), getCateringMarketplaceById);

// Update catering marketplace with auth
router.put('/update', auth, validateBody(updateCateringMarketplaceSchema), updateCateringMarketplace);

// Delete catering marketplace by ID with auth
router.delete('/delete/:id', auth, validateParams(getCateringMarketplaceByIdSchema), deleteCateringMarketplace);

module.exports = router;
