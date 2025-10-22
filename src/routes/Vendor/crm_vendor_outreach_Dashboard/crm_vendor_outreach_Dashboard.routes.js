const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createVendorLead, 
  getAllVendorLeads, 
  getVendorLeadById, 
  getVendorLeadsByAuth,
  updateVendorLead, 
  updateVendorLeadByIdBody, 
  deleteVendorLead 
} = require('../../../controllers/vendor_leads.controller'); 

// Import middleware
const { auth } = require('../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../middleware/validation');

// Import validators
const { 
  createVendorLeadsSchema, 
  updateVendorLeadsSchema, 
  updateVendorLeadsByIdBodySchema, 
  getVendorLeadsByIdSchema, 
  getAllVendorLeadsSchema 
} = require('../../../../validators/vendor_leads.validator');

// Create vendor lead with auth
router.post('/create', auth, validateBody(createVendorLeadsSchema), createVendorLead);

// Get all vendor leads with auth
router.get('/getAll', auth, validateQuery(getAllVendorLeadsSchema), getAllVendorLeads);

// Get vendor leads by authenticated user with auth
router.get('/getByAuth', auth, validateQuery(getAllVendorLeadsSchema), getVendorLeadsByAuth);

// Get vendor lead by ID with auth
router.get('/getById/:id', auth, validateParams(getVendorLeadsByIdSchema), getVendorLeadById);

// Update vendor lead by ID with auth
router.put('/updateById', auth, validateBody(updateVendorLeadsByIdBodySchema), updateVendorLeadByIdBody);

// Delete vendor lead by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getVendorLeadsByIdSchema), deleteVendorLead);

module.exports = router;
