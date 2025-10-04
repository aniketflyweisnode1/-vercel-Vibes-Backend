const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createItemCategorySchema, updateItemCategorySchema, querySchema, idSchema } = require('../../../validators/item_category.validator');
const { createItemCategory, getAllItemCategories, getItemCategoryById, getItemCategoriesByAuth, updateItemCategory, deleteItemCategory } = require('../../controllers/item_category.controller');

// Create item category (with auth)
router.post('/create', auth, validateBody(createItemCategorySchema), createItemCategory);

// Get all item categories (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllItemCategories);

// Get item categories by authenticated user (with auth)
router.get('/my-categories', auth, validateQuery(querySchema), getItemCategoriesByAuth);

// Get item category by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getItemCategoryById);

// Update item category (with auth)
router.put('/update', auth, validateBody(updateItemCategorySchema), updateItemCategory);

// Delete item category (with auth)
router.delete('/delete/:id', auth, validateParams(idSchema), deleteItemCategory);

module.exports = router;
