const express = require('express');
const router = express.Router();

const { 
  createDrinks, 
  getAllDrinks, 
  getDrinksById, 
  getDrinksByAuth, 
  updateDrinks, 
  deleteDrinks 
} = require('../../controllers/drinks.controller');

const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { 
  createDrinksSchema, 
  updateDrinksSchema, 
  getDrinksByIdSchema, 
  getAllDrinksSchema 
} = require('../../../validators/drinks.validator');

// Create drinks (with auth)
router.post('/create', auth, validateBody(createDrinksSchema), createDrinks);

// Get all drinks
router.get('/getAll', validateQuery(getAllDrinksSchema), getAllDrinks);

// Get drinks by ID (with auth)
router.get('/getDrinksById/:id', auth, validateParams(getDrinksByIdSchema), getDrinksById);

// Get drinks by authenticated user (with auth)
router.get('/getDrinksByAuth', auth, getDrinksByAuth);

// Update drinks by ID (with auth)
router.put('/updateDrinksById', auth, validateBody(updateDrinksSchema), updateDrinks);

// Delete drinks by ID (with auth)
router.delete('/deleteDrinksById/:id', auth, validateParams(getDrinksByIdSchema), deleteDrinks);

module.exports = router;

