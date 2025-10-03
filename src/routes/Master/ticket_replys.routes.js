const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createTicketReply, 
  updateAllTicketReplies, 
  getAllTicketReplies, 
  getTicketReplyById, 
  getTicketReplyByAuth, 
  updateTicketReply, 
  deleteTicketReply 
} = require('../../controllers/ticket_replys.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createTicketReplySchema, 
  updateAllTicketRepliesSchema, 
  updateTicketReplySchema, 
  getTicketReplyByIdSchema, 
  getAllTicketRepliesSchema 
} = require('../../../validators/ticket_replys.validator');

// Create ticket reply (with auth)
router.post('/create', auth, validateBody(createTicketReplySchema), createTicketReply);

// Update all ticket replies (with auth)
router.put('/updateAll', auth, validateBody(updateAllTicketRepliesSchema), updateAllTicketReplies);

// Get all ticket replies (with auth)
router.get('/getAll', auth, validateQuery(getAllTicketRepliesSchema), getAllTicketReplies);

// Get ticket reply by ID (with auth)
router.get('/getTicketReplyById/:id', auth, validateParams(getTicketReplyByIdSchema), getTicketReplyById);

// Get ticket replies by authenticated user (with auth)
router.get('/getTicketReplyByAuth', auth, getTicketReplyByAuth);

// Update ticket reply by ID (with auth)
router.put('/updateTicketReplyById', auth, validateBody(updateTicketReplySchema), updateTicketReply);

// Delete ticket reply by ID (with auth)
router.delete('/deleteTicketReplyById/:id', auth, validateParams(getTicketReplyByIdSchema), deleteTicketReply);

module.exports = router;
