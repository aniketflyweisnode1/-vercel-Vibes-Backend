const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createCountry, 
  getAllCountries, 
  getCountryById, 
  updateCountry,
  deleteCountry
} = require('../../controllers/country.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createCountrySchema, 
  updateCountrySchema, 
  getCountryByIdSchema, 
  getAllCountriesSchema 
} = require('../../../validators/country.validator');

// Create country with auth
router.post('/create',  validateBody(createCountrySchema), createCountry);

// Get all countries with auth
router.get('/getAll',   getAllCountries);

// Get country by ID with auth
router.get('/getById/:id', auth, validateParams(getCountryByIdSchema), getCountryById);

// Update country by ID with auth
router.put('/updateById', auth, validateBody(updateCountrySchema), updateCountry);

// Delete country by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getCountryByIdSchema), deleteCountry);

module.exports = router;
