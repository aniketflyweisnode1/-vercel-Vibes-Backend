const express = require('express');
const router = express.Router();

const { 
  createEventTheme, 
  getAllEventTheme, 
  getEventThemeById, 
  getEventThemeByAuth, 
  updateEventTheme, 
  deleteEventTheme 
} = require('../../controllers/event_theme.controller');

const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { 
  createEventThemeSchema, 
  updateEventThemeSchema, 
  getEventThemeByIdSchema, 
  getAllEventThemeSchema 
} = require('../../../validators/event_theme.validator');

// Create event theme (with auth)
router.post('/create', auth, validateBody(createEventThemeSchema), createEventTheme);

// Get all event themes
router.get('/getAll', validateQuery(getAllEventThemeSchema), getAllEventTheme);

// Get event theme by ID (with auth)
router.get('/getEventThemeById/:id', auth, validateParams(getEventThemeByIdSchema), getEventThemeById);

// Get event theme by authenticated user (with auth)
router.get('/getEventThemeByAuth', auth, getEventThemeByAuth);

// Update event theme by ID (with auth)
router.put('/updateEventThemeById', auth, validateBody(updateEventThemeSchema), updateEventTheme);

// Delete event theme by ID (with auth)
router.delete('/deleteEventThemeById/:id', auth, validateParams(getEventThemeByIdSchema), deleteEventTheme);

module.exports = router;

