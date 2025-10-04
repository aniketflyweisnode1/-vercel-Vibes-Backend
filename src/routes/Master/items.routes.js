const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createItemsSchema, updateItemsSchema, querySchema, idSchema, categoryIdSchema } = require('../../../validators/items.validator');
const { createItem, getAllItems, getItemById, getItemsByCategoryId, updateItem, deleteItem } = require('../../controllers/items.controller');

// Create item (with auth)
router.post('/create', auth, validateBody(createItemsSchema), createItem);

// Get all items (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllItems);

// Get items by category ID (with auth)
router.get('/category/:categoryId', auth, validateParams(categoryIdSchema), validateQuery(querySchema), getItemsByCategoryId);

// Get item by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getItemById);

// Update item (with auth)
router.put('/update', auth, validateBody(updateItemsSchema), updateItem);

// Delete item (with auth)
router.delete('/delete/:id', auth, validateParams(idSchema), deleteItem);

module.exports = router;
