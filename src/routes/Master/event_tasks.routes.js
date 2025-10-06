const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createEventTaskSchema, updateEventTaskSchema, querySchema, idSchema } = require('../../../validators/event_tasks.validator');
const { createEventTask, getAllEventTasks, getEventTaskById, getEventTasksByAuth, updateEventTask, deleteEventTask } = require('../../controllers/event_tasks.controller');

// Create event task (with auth)
router.post('/create', auth, validateBody(createEventTaskSchema), createEventTask);

// Get all event tasks (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllEventTasks);

// Get event tasks by authenticated user (with auth)
router.get('/my-tasks', auth, validateQuery(querySchema), getEventTasksByAuth);

// Get event task by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getEventTaskById);

// Update event task (with auth)
router.put('/update', auth, validateBody(updateEventTaskSchema), updateEventTask);

// Delete event task (with auth)
router.delete('/delete/:id', auth, deleteEventTask);

module.exports = router;