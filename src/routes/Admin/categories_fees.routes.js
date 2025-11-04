const express = require('express');
const router = express.Router();

const { 
  createCategoriesFees, 
  getAllCategoriesFees, 
  getCategoriesFeesById, 
  updateCategoriesFees,
  deleteCategoriesFees
} = require('../../controllers/categories_fees.controller');

const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { 
  createCategoriesFeesSchema, 
  updateCategoriesFeesSchema, 
  getCategoriesFeesByIdSchema, 
  getAllCategoriesFeesSchema 
} = require('../../../validators/categories_fees.validator');

// Create categories fees (with auth)
router.post('/create', auth, validateBody(createCategoriesFeesSchema), createCategoriesFees);

// Get all categories fees
router.get('/getAll', validateQuery(getAllCategoriesFeesSchema), getAllCategoriesFees);

// Get categories fees by ID (with auth)
router.get('/getById/:id', auth, validateParams(getCategoriesFeesByIdSchema), getCategoriesFeesById);

// Update categories fees by ID (with auth)
router.put('/updateById', auth, validateBody(updateCategoriesFeesSchema), updateCategoriesFees);

// Delete categories fees by ID (with auth)
router.delete('/deleteById/:id', auth, validateParams(getCategoriesFeesByIdSchema), deleteCategoriesFees);

module.exports = router;

