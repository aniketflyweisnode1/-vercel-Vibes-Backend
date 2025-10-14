const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createBusinessCategory, 
  getAllBusinessCategories, 
  getBusinessCategoryById, 
  updateBusinessCategory, 
  updateBusinessCategoryByIdBody, 
  deleteBusinessCategory, 
  getBusinessCategoriesByAuth 
} = require('../../controllers/business_category.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createBusinessCategorySchema, 
  updateBusinessCategorySchema, 
  updateBusinessCategoryByIdBodySchema, 
  getBusinessCategoryByIdSchema, 
  getAllBusinessCategoriesSchema 
} = require('../../../validators/business_category.validator');

// Create business category with auth
router.post('/create', auth, validateBody(createBusinessCategorySchema), createBusinessCategory);

// Get all business categories (no auth, no validation)
router.get('/getAll', getAllBusinessCategories);

// Get business categories by authenticated user with auth (no validation)
router.get('/getByAuth', auth, getBusinessCategoriesByAuth);

// Get business category by ID with auth
router.get('/getById/:id', auth, validateParams(getBusinessCategoryByIdSchema), getBusinessCategoryById);

// Update business category by ID with auth
router.put('/updateById', auth, validateBody(updateBusinessCategoryByIdBodySchema), updateBusinessCategoryByIdBody);

// Delete business category by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getBusinessCategoryByIdSchema), deleteBusinessCategory);

module.exports = router;
