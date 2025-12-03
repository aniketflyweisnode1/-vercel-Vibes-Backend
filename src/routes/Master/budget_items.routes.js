const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createBudgetItemsSchema, updateBudgetItemsSchema, querySchema, idSchema } = require('../../../validators/budget_items.validator');
const { createBudgetItems, getAllBudgetItems, getBudgetItemsById, updateBudgetItems, deleteBudgetItems } = require('../../controllers/budget_items.controller');

// Create budget items (with auth)
router.post('/create', auth, validateBody(createBudgetItemsSchema), createBudgetItems);

// Get all budget items (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllBudgetItems);

// Get budget items by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getBudgetItemsById);

// Update budget items (with auth)
router.put('/update', auth,  updateBudgetItems);

// Delete budget items (with auth)
router.delete('/delete/:id', auth, deleteBudgetItems);

module.exports = router;
