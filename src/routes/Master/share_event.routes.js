const express = require('express');
const router = express.Router();

const { 
  createShareEvent, 
  getAllShareEvent, 
  getShareEventById, 
  getShareEventByAuth, 
  updateShareEvent, 
  deleteShareEvent 
} = require('../../controllers/share_event.controller');

const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { 
  createShareEventSchema, 
  updateShareEventSchema, 
  getShareEventByIdSchema, 
  getAllShareEventSchema 
} = require('../../../validators/share_event.validator');

// Create share event (with auth)
router.post('/create', auth, validateBody(createShareEventSchema), createShareEvent);

// Get all share events
router.get('/getAll', validateQuery(getAllShareEventSchema), getAllShareEvent);

// Get share event by ID (with auth)
router.get('/getShareEventById/:id', auth, validateParams(getShareEventByIdSchema), getShareEventById);

// Get share event by authenticated user (with auth)
router.get('/getShareEventByAuth', auth, getShareEventByAuth);

// Update share event by ID (with auth)
router.put('/updateShareEventById', auth, validateBody(updateShareEventSchema), updateShareEvent);

// Delete share event by ID (with auth)
router.delete('/deleteShareEventById/:id', auth, validateParams(getShareEventByIdSchema), deleteShareEvent);

module.exports = router;

