const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createTicketType, 
  getAllTicketTypes, 
  getTicketTypeById, 
  getTicketTypeByAuth, 
  updateTicketType, 
  deleteTicketType 
} = require('../../controllers/ticket_type.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createTicketTypeSchema, 
  updateTicketTypeSchema, 
  getTicketTypeByIdSchema, 
  getAllTicketTypesSchema 
} = require('../../../validators/ticket_type.validator');

// Create ticket type (with auth)
router.post('/create', auth, validateBody(createTicketTypeSchema), createTicketType);

// Get all ticket types (with auth)
router.get('/getAll', auth, validateQuery(getAllTicketTypesSchema), getAllTicketTypes);

// Get ticket type by ID (with auth)
router.get('/getTicketTypeById/:id', auth, validateParams(getTicketTypeByIdSchema), getTicketTypeById);

// Get ticket types by authenticated user (with auth)
router.get('/getTicketTypeByAuth', auth, getTicketTypeByAuth);

// Update ticket type by ID (with auth)
router.put('/updateTicketTypeById', auth, validateBody(updateTicketTypeSchema), updateTicketType);

// Delete ticket type by ID (with auth)
router.delete('/deleteTicketTypeById/:id', auth, validateParams(getTicketTypeByIdSchema), deleteTicketType);

module.exports = router;
