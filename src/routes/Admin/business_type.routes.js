const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createBusinessType, 
  getAllBusinessTypes, 
  getBusinessTypeById, 
  updateBusinessType, 
  updateBusinessTypeByIdBody, 
  deleteBusinessType, 
  getBusinessTypesByAuth 
} = require('../../controllers/business_type.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createBusinessTypeSchema, 
  updateBusinessTypeSchema, 
  updateBusinessTypeByIdBodySchema, 
  getBusinessTypeByIdSchema, 
  getAllBusinessTypesSchema 
} = require('../../../validators/business_type.validator');

// Create business type with auth
router.post('/create', auth, validateBody(createBusinessTypeSchema), createBusinessType);

// Get all business types with auth
router.get('/getAll', auth, validateQuery(getAllBusinessTypesSchema), getAllBusinessTypes);

// Get business types by authenticated user with auth
router.get('/getByAuth', auth, validateQuery(getAllBusinessTypesSchema), getBusinessTypesByAuth);

// Get business type by ID with auth
router.get('/getById/:id', auth, validateParams(getBusinessTypeByIdSchema), getBusinessTypeById);

// Update business type by ID with auth
router.put('/updateById', auth, validateBody(updateBusinessTypeByIdBodySchema), updateBusinessTypeByIdBody);

// Delete business type by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getBusinessTypeByIdSchema), deleteBusinessType);

module.exports = router;
