const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createLeadDiscovered, 
  getAllLeadDiscovered, 
  getLeadDiscoveredById, 
  updateLeadDiscovered, 
  updateLeadDiscoveredByIdBody, 
  deleteLeadDiscovered 
} = require('../../../controllers/lead_discovered.controller'); 

// Import middleware
const { auth } = require('../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../middleware/validation');

// Import validators
const { 
  createLeadDiscoveredSchema, 
  updateLeadDiscoveredSchema, 
  updateLeadDiscoveredByIdBodySchema, 
  getLeadDiscoveredByIdSchema, 
  getAllLeadDiscoveredSchema 
} = require('../../../../validators/lead_discovered.validator');

// Create lead discovered with auth
router.post('/create', auth, validateBody(createLeadDiscoveredSchema), createLeadDiscovered);

// Get all lead discovered with auth
router.get('/getAll', auth, validateQuery(getAllLeadDiscoveredSchema), getAllLeadDiscovered);

// Get lead discovered by ID with auth
router.get('/getById/:id', auth, validateParams(getLeadDiscoveredByIdSchema), getLeadDiscoveredById);

// Update lead discovered by ID with auth
router.put('/updateById', auth, validateBody(updateLeadDiscoveredByIdBodySchema), updateLeadDiscoveredByIdBody);

// Delete lead discovered by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getLeadDiscoveredByIdSchema), deleteLeadDiscovered);

module.exports = router;
