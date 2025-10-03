const express = require('express');
const router = express.Router();

const { 
  createDressCode, 
  getAllDressCode, 
  getDressCodeById, 
  getDressCodeByAuth, 
  updateDressCode, 
  deleteDressCode 
} = require('../../controllers/dress_code.controller');

const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { 
  createDressCodeSchema, 
  updateDressCodeSchema, 
  getDressCodeByIdSchema, 
  getAllDressCodeSchema 
} = require('../../../validators/dress_code.validator');

// Create dress code (with auth)
router.post('/create', auth, validateBody(createDressCodeSchema), createDressCode);

// Get all dress codes
router.get('/getAll', validateQuery(getAllDressCodeSchema), getAllDressCode);

// Get dress code by ID (with auth)
router.get('/getDressCodeById/:id', auth, validateParams(getDressCodeByIdSchema), getDressCodeById);

// Get dress code by authenticated user (with auth)
router.get('/getDressCodeByAuth', auth, getDressCodeByAuth);

// Update dress code by ID (with auth)
router.put('/updateDressCodeById', auth, validateBody(updateDressCodeSchema), updateDressCode);

// Delete dress code by ID (with auth)
router.delete('/deleteDressCodeById/:id', auth, validateParams(getDressCodeByIdSchema), deleteDressCode);

module.exports = router;

