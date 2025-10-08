const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createCity, 
  getAllCities, 
  getCityById, 
  updateCity,
  getCitiesByCountryId,
  getCitiesByStateId,
  deleteCity
} = require('../../controllers/city.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody,  validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createCitySchema, 
  updateCitySchema, 
  getCityByIdSchema, 
  getCitiesByCountryIdSchema,
  getCitiesByStateIdSchema
} = require('../../../validators/city.validator');

// Create city with auth
router.post('/create',  validateBody(createCitySchema), createCity);

// Get all cities with auth
router.get('/getAll',  getAllCities);

// Get city by ID with auth
router.get('/getById/:id', auth, validateParams(getCityByIdSchema), getCityById);

// Get cities by country ID with auth
router.get('/getByCountryId/:countryId',  validateParams(getCitiesByCountryIdSchema), getCitiesByCountryId);

// Get cities by state ID with auth
router.get('/getByStateId/:stateId',  validateParams(getCitiesByStateIdSchema), getCitiesByStateId);

// Update city by ID with auth
router.put('/updateById', auth, validateBody(updateCitySchema), updateCity);

// Delete city by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getCityByIdSchema), deleteCity);

module.exports = router;
