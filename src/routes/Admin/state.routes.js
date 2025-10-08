const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createState, 
  getAllStates, 
  getStateById, 
  updateState,
  getStatesByCountryId,
  deleteState
} = require('../../controllers/state.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createStateSchema, 
  updateStateSchema, 
  getStateByIdSchema, 
  getAllStatesSchema,
  getStatesByCountryIdSchema
} = require('../../../validators/state.validator');

// Create state with auth
router.post('/create', validateBody(createStateSchema), createState);

// Get all states with auth
router.get('/getAll',  getAllStates);

// Get state by ID with auth
router.get('/getById/:id', auth, validateParams(getStateByIdSchema), getStateById);

// Get states by country ID with auth
router.get('/getByCountryId/:countryId', validateParams(getStatesByCountryIdSchema), getStatesByCountryId);

// Update state by ID with auth
router.put('/updateById', auth, validateBody(updateStateSchema), updateState);

// Delete state by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getStateByIdSchema), deleteState);

module.exports = router;
