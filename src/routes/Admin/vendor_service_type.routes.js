const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createVendorServiceType, 
  getAllVendorServiceTypes, 
  getVendorServiceTypeById, 
  updateVendorServiceType, 
  deleteVendorServiceType, 
  getVendorServiceTypesByAuth 
} = require('../../controllers/vendor_service_type.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createVendorServiceTypeSchema, 
  updateVendorServiceTypeSchema, 
  getVendorServiceTypeByIdSchema, 
  getAllVendorServiceTypesSchema 
} = require('../../../validators/vendor_service_type.validator');

// Create vendor service type with auth
router.post('/create', auth, validateBody(createVendorServiceTypeSchema), createVendorServiceType);

// Get all vendor service types with auth
router.get('/getAll', auth, validateQuery(getAllVendorServiceTypesSchema), getAllVendorServiceTypes);

// Get vendor service types by authenticated user with auth
router.get('/getByAuth', auth, validateQuery(getAllVendorServiceTypesSchema), getVendorServiceTypesByAuth);

// Get vendor service type by ID with auth
router.get('/getById/:id', auth, validateParams(getVendorServiceTypeByIdSchema), getVendorServiceTypeById);

// Update vendor service type by ID with auth
router.put('/updateById', auth, validateBody(updateVendorServiceTypeSchema), updateVendorServiceType);

// Delete vendor service type by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getVendorServiceTypeByIdSchema), deleteVendorServiceType);

module.exports = router;
