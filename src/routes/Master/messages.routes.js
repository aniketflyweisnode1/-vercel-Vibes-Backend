const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createMessage, 
  getAllMessages, 
  getMessageById, 
  getMessageByAuth, 
  updateMessage, 
  deleteMessage 
} = require('../../controllers/messages.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createMessageSchema, 
  updateMessageSchema, 
  getMessageByIdSchema, 
  getAllMessagesSchema 
} = require('../../../validators/messages.validator');

// Create message (with auth)
router.post('/create', auth, validateBody(createMessageSchema), createMessage);

// Get all messages (with auth)
router.get('/getAll', auth, validateQuery(getAllMessagesSchema), getAllMessages);

// Get message by ID (with auth)
router.get('/getMessageById/:id', auth, validateParams(getMessageByIdSchema), getMessageById);

// Get messages by authenticated user (with auth)
router.get('/getMessageByAuth', auth, getMessageByAuth);

// Update message by ID (with auth)
router.put('/updateMessageById', auth, validateBody(updateMessageSchema), updateMessage);

// Delete message by ID (with auth)
router.delete('/deleteMessageById/:id', auth, validateParams(getMessageByIdSchema), deleteMessage);

module.exports = router;
