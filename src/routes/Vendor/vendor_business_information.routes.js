const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createVendorBusinessInformation, 
  getAllVendorBusinessInformation, 
  getVendorBusinessInformationById, 
  getVendorBusinessInformationByAuth,
  updateVendorBusinessInformation, 
  updateVendorBusinessInformationByIdBody, 
  deleteVendorBusinessInformation 
} = require('../../controllers/vendor_business_information.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createVendorBusinessInformationSchema, 
  updateVendorBusinessInformationSchema, 
  updateVendorBusinessInformationByIdBodySchema, 
  getVendorBusinessInformationByIdSchema, 
  getAllVendorBusinessInformationSchema 
} = require('../../../validators/vendor_business_information.validator');

// Create vendor business information with auth
router.post('/create', auth, validateBody(createVendorBusinessInformationSchema), createVendorBusinessInformation);

// Get all vendor business information with auth
router.get('/getAll', auth, validateQuery(getAllVendorBusinessInformationSchema), getAllVendorBusinessInformation);

// Get vendor business information by authenticated vendor with auth
router.get('/getByAuth', auth, validateQuery(getAllVendorBusinessInformationSchema), getVendorBusinessInformationByAuth);

// Get vendor business information by ID with auth
router.get('/getById/:id', auth, validateParams(getVendorBusinessInformationByIdSchema), getVendorBusinessInformationById);

// Update vendor business information by ID with auth
router.put('/updateById', auth, validateBody(updateVendorBusinessInformationByIdBodySchema), updateVendorBusinessInformationByIdBody);

// Delete vendor business information by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getVendorBusinessInformationByIdSchema), deleteVendorBusinessInformation);

module.exports = router;
