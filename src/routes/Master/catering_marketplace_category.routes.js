const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createCateringMarketplaceCategory, 
  getAllCateringMarketplaceCategories, 
  getCateringMarketplaceCategoryById, 
  getCateringMarketplaceCategoriesByAuth,
  updateCateringMarketplaceCategory, 
  deleteCateringMarketplaceCategory
} = require('../../controllers/catering_marketplace_category.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createCateringMarketplaceCategorySchema, 
  updateCateringMarketplaceCategorySchema, 
  getCateringMarketplaceCategoryByIdSchema
} = require('../../../validators/catering_marketplace_category.validator');

// Create catering marketplace category with auth
router.post('/create', auth, validateBody(createCateringMarketplaceCategorySchema), createCateringMarketplaceCategory);

// Get all catering marketplace categories (no auth, no validation)
router.get('/getAll', getAllCateringMarketplaceCategories);

// Get catering marketplace category by ID with auth
router.get('/getById/:id', auth, validateParams(getCateringMarketplaceCategoryByIdSchema), getCateringMarketplaceCategoryById);

// Get catering marketplace categories by authenticated user with auth
router.get('/getByAuth', auth, getCateringMarketplaceCategoriesByAuth);

// Update catering marketplace category with auth
router.put('/update', auth, validateBody(updateCateringMarketplaceCategorySchema), updateCateringMarketplaceCategory);

// Delete catering marketplace category by ID with auth
router.delete('/delete/:id', auth, validateParams(getCateringMarketplaceCategoryByIdSchema), deleteCateringMarketplaceCategory);

module.exports = router;
