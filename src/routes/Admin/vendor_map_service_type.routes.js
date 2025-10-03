const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createVendorMapServiceType, 
  getAllVendorMapServiceTypes, 
  getVendorMapServiceTypeById, 
  updateVendorMapServiceType 
} = require('../../controllers/vendor_map_service_type.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createVendorMapServiceTypeSchema, 
  updateVendorMapServiceTypeSchema, 
  getVendorMapServiceTypeByIdSchema, 
  getAllVendorMapServiceTypesSchema 
} = require('../../../validators/vendor_map_service_type.validator');

// Create vendor map service type with auth
router.post('/create', auth, validateBody(createVendorMapServiceTypeSchema), createVendorMapServiceType);

// Get all vendor map service types with auth
router.get('/getAll', auth, validateQuery(getAllVendorMapServiceTypesSchema), getAllVendorMapServiceTypes);

// Get vendor map service type by ID with auth
router.get('/getById/:id', auth, validateParams(getVendorMapServiceTypeByIdSchema), getVendorMapServiceTypeById);

// Update vendor map service type by ID with auth
router.put('/updateById', auth, validateBody(updateVendorMapServiceTypeSchema), updateVendorMapServiceType);

module.exports = router;
