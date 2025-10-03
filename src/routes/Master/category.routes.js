const express = require('express');
const router = express.Router();

const { 
  createCategory, 
  getAllCategory, 
  getCategoryById, 
  getCategoryByAuth, 
  updateCategory, 
  deleteCategory 
} = require('../../controllers/category.controller');

const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { 
  createCategorySchema, 
  updateCategorySchema, 
  getCategoryByIdSchema, 
  getAllCategorySchema 
} = require('../../../validators/category.validator');

// Create category (with auth)
router.post('/create', auth, validateBody(createCategorySchema), createCategory);

// Get all categories
router.get('/getAll', validateQuery(getAllCategorySchema), getAllCategory);

// Get category by ID (with auth)
router.get('/getCategoryById/:id', auth, validateParams(getCategoryByIdSchema), getCategoryById);

// Get category by authenticated user (with auth)
router.get('/getCategoryByAuth', auth, getCategoryByAuth);

// Update category by ID (with auth)
router.put('/updateCategoryById', auth, validateBody(updateCategorySchema), updateCategory);

// Delete category by ID (with auth)
router.delete('/deleteCategoryById/:id', auth, validateParams(getCategoryByIdSchema), deleteCategory);

module.exports = router;

