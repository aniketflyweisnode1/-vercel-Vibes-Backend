const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createEventDiscussionChatSchema, updateEventDiscussionChatSchema, querySchema, idSchema, eventIdSchema } = require('../../../validators/event_discussion_chat.validator');
const { createEventDiscussionChat, getAllEventDiscussionChats, getEventDiscussionChatById, getEventDiscussionChatsByAuth, updateEventDiscussionChat, deleteEventDiscussionChat, getEventDiscussionChatsByEventId } = require('../../controllers/event_discussion_chat.controller');

// Create event discussion chat (with auth)
router.post('/create', auth, validateBody(createEventDiscussionChatSchema), createEventDiscussionChat);

// Get all event discussion chats (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllEventDiscussionChats);

// Get event discussion chats by authenticated user (with auth)
router.get('/my-discussions', auth, validateQuery(querySchema), getEventDiscussionChatsByAuth);

// Get event discussion chats by event ID (with auth)
router.get('/event/:eventId', auth, validateParams(eventIdSchema), validateQuery(querySchema), getEventDiscussionChatsByEventId);

// Get event discussion chat by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getEventDiscussionChatById);

// Update event discussion chat (with auth)
router.put('/update', auth, validateBody(updateEventDiscussionChatSchema), updateEventDiscussionChat);

// Delete event discussion chat (with auth)
router.delete('/delete/:id', auth, deleteEventDiscussionChat);

module.exports = router;