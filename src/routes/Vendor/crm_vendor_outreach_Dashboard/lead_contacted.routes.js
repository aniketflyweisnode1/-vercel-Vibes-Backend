const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createLeadContacted, 
  getAllLeadContacted, 
  getLeadContactedById, 
  updateLeadContacted, 
  updateLeadContactedByIdBody, 
  deleteLeadContacted 
} = require('../../../controllers/lead_contacted.controller'); 

// Import middleware
const { auth } = require('../../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../../middleware/validation');

// Import validators
const { 
  createLeadContactedSchema, 
  updateLeadContactedSchema, 
  updateLeadContactedByIdBodySchema, 
  getLeadContactedByIdSchema, 
  getAllLeadContactedSchema 
} = require('../../../../validators/lead_contacted.validator');

// Create lead contacted with auth
router.post('/create', auth, validateBody(createLeadContactedSchema), createLeadContacted);

// Get all lead contacted with auth
router.get('/getAll', auth, validateQuery(getAllLeadContactedSchema), getAllLeadContacted);

// Get lead contacted by ID with auth
router.get('/getById/:id', auth, validateParams(getLeadContactedByIdSchema), getLeadContactedById);

// Update lead contacted by ID with auth
router.put('/updateById', auth, validateBody(updateLeadContactedByIdBodySchema), updateLeadContactedByIdBody);

// Delete lead contacted by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getLeadContactedByIdSchema), deleteLeadContacted);

module.exports = router;
