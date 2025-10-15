const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createStaffWorkingPrice, 
  getAllStaffWorkingPrices, 
  getStaffWorkingPriceById, 
  getStaffWorkingPricesByCategoryId,
  updateStaffWorkingPrice, 
  deleteStaffWorkingPrice
} = require('../../controllers/staff_working_price.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createStaffWorkingPriceSchema, 
  updateStaffWorkingPriceSchema, 
  getStaffWorkingPriceByIdSchema
} = require('../../../validators/staff_working_price.validator');

// Create staff working price with auth (auto-increments review_count by 1)
router.post('/create', auth, validateBody(createStaffWorkingPriceSchema), createStaffWorkingPrice);

// Get all staff working prices (no auth, no validation)
router.get('/getAll', getAllStaffWorkingPrices);

// Get staff working price by ID with auth
router.get('/getById/:id', auth, validateParams(getStaffWorkingPriceByIdSchema), getStaffWorkingPriceById);

// Get staff working prices by category ID
router.get('/getByCategoryId/:id', validateParams(getStaffWorkingPriceByIdSchema), getStaffWorkingPricesByCategoryId);

// Update staff working price with auth
router.put('/update', auth, validateBody(updateStaffWorkingPriceSchema), updateStaffWorkingPrice);

// Delete staff working price by ID with auth
router.delete('/delete/:id', auth, validateParams(getStaffWorkingPriceByIdSchema), deleteStaffWorkingPrice);

module.exports = router;

