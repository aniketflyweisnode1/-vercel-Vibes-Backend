const express = require('express');
const router = express.Router();

const { 
  createCompaignType, 
  getAllCompaignType, 
  getCompaignTypeById, 
  updateCompaignType, 
  deleteCompaignType 
} = require('../../controllers/compaign_type.controller');

const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { 
  createCompaignTypeSchema, 
  updateCompaignTypeSchema, 
  getCompaignTypeByIdSchema, 
  getAllCompaignTypeSchema 
} = require('../../../validators/compaign_type.validator');

// Create compaign type (with auth)
router.post('/create', auth, validateBody(createCompaignTypeSchema), createCompaignType);

// Get all compaign types
router.get('/getAll', validateQuery(getAllCompaignTypeSchema), getAllCompaignType);

// Get compaign type by ID (with auth)
router.get('/getCompaignTypeById/:id', auth, validateParams(getCompaignTypeByIdSchema), getCompaignTypeById);

// Update compaign type by ID (with auth)
router.put('/updateCompaignTypeById', auth, validateBody(updateCompaignTypeSchema), updateCompaignType);

// Delete compaign type by ID (with auth)
router.delete('/deleteCompaignTypeById/:id', auth, validateParams(getCompaignTypeByIdSchema), deleteCompaignType);

module.exports = router;

