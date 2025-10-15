const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createStaffCategory, 
  getAllStaffCategories, 
  getStaffCategoryById, 
  getStaffCategoriesByAuth,
  updateStaffCategory, 
  deleteStaffCategory
} = require('../../controllers/staff_category.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createStaffCategorySchema, 
  updateStaffCategorySchema, 
  getStaffCategoryByIdSchema
} = require('../../../validators/staff_category.validator');

// Create staff category with auth
router.post('/create', auth, validateBody(createStaffCategorySchema), createStaffCategory);

// Get all staff categories (no auth, no validation)
router.get('/getAll', getAllStaffCategories);

// Get staff categories by authenticated user with auth
router.get('/getByAuth', auth, getStaffCategoriesByAuth);

// Get staff category by ID with auth
router.get('/getById/:id', auth, validateParams(getStaffCategoryByIdSchema), getStaffCategoryById);

// Update staff category with auth
router.put('/update', auth, validateBody(updateStaffCategorySchema), updateStaffCategory);

// Delete staff category by ID with auth
router.delete('/delete/:id', auth, validateParams(getStaffCategoryByIdSchema), deleteStaffCategory);

module.exports = router;

