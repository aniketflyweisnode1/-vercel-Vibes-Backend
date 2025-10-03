const express = require('express');
const router = express.Router();

const { 
  createEntertainment, 
  getAllEntertainment, 
  getEntertainmentById, 
  getEntertainmentByAuth, 
  updateEntertainment, 
  deleteEntertainment 
} = require('../../controllers/entertainment.controller');

const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { 
  createEntertainmentSchema, 
  updateEntertainmentSchema, 
  getEntertainmentByIdSchema, 
  getAllEntertainmentSchema 
} = require('../../../validators/entertainment.validator');

// Create entertainment (with auth)
router.post('/create', auth, validateBody(createEntertainmentSchema), createEntertainment);

// Get all entertainment
router.get('/getAll', validateQuery(getAllEntertainmentSchema), getAllEntertainment);

// Get entertainment by ID (with auth)
router.get('/getEntertainmentById/:id', auth, validateParams(getEntertainmentByIdSchema), getEntertainmentById);

// Get entertainment by authenticated user (with auth)
router.get('/getEntertainmentByAuth', auth, getEntertainmentByAuth);

// Update entertainment by ID (with auth)
router.put('/updateEntertainmentById', auth, validateBody(updateEntertainmentSchema), updateEntertainment);

// Delete entertainment by ID (with auth)
router.delete('/deleteEntertainmentById/:id', auth, validateParams(getEntertainmentByIdSchema), deleteEntertainment);

module.exports = router;

