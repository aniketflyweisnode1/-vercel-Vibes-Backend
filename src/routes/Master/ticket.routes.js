const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createTicket, 
  getAllTickets, 
  getTicketById, 
  getTicketByAuth, 
  getTicketByTicketType, 
  updateTicket, 
  deleteTicket 
} = require('../../controllers/ticket.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createTicketSchema, 
  updateTicketSchema, 
  getTicketByIdSchema, 
  getTicketByTicketTypeSchema, 
  getAllTicketsSchema 
} = require('../../../validators/ticket.validator');

// Create ticket (with auth)
router.post('/create', auth, validateBody(createTicketSchema), createTicket);

// Get all tickets (with auth)
router.get('/getAll', auth, validateQuery(getAllTicketsSchema), getAllTickets);

// Get ticket by ID (with auth)
router.get('/getTicketById/:id', auth, validateParams(getTicketByIdSchema), getTicketById);

// Get tickets by authenticated user (with auth)
router.get('/getTicketByAuth', auth, getTicketByAuth);

// Get tickets by ticket type (with auth)
router.get('/getTicketByTicketType/:ticketTypeId', auth, validateParams(getTicketByTicketTypeSchema), getTicketByTicketType);

// Update ticket by ID (with auth)
router.put('/updateTicketById', auth, validateBody(updateTicketSchema), updateTicket);

// Delete ticket by ID (with auth)
router.delete('/deleteTicketById/:id', auth, validateParams(getTicketByIdSchema), deleteTicket);

module.exports = router;
