const express = require('express');
const router = express.Router();

const { 
  createFood, 
  getAllFood, 
  getFoodById, 
  getFoodByAuth, 
  updateFood, 
  deleteFood 
} = require('../../controllers/food.controller');

const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { 
  createFoodSchema, 
  updateFoodSchema, 
  getFoodByIdSchema, 
  getAllFoodSchema 
} = require('../../../validators/food.validator');

// Create food (with auth)
router.post('/create', auth, validateBody(createFoodSchema), createFood);

// Get all food
router.get('/getAll', validateQuery(getAllFoodSchema), getAllFood);

// Get food by ID (with auth)
router.get('/getFoodById/:id', auth, validateParams(getFoodByIdSchema), getFoodById);

// Get food by authenticated user (with auth)
router.get('/getFoodByAuth', auth, getFoodByAuth);

// Update food by ID (with auth)
router.put('/updateFoodById', auth, validateBody(updateFoodSchema), updateFood);

// Delete food by ID (with auth)
router.delete('/deleteFoodById/:id', auth, validateParams(getFoodByIdSchema), deleteFood);

module.exports = router;

