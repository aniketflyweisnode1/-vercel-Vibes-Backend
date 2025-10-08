const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createEventCategoryTags, 
  getAllEventCategoryTags, 
  getEventCategoryTagsById, 
  updateEventCategoryTags,
  deleteEventCategoryTags
} = require('../../controllers/event_category_tags.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createEventCategoryTagsSchema, 
  updateEventCategoryTagsSchema, 
  getEventCategoryTagsByIdSchema, 
  getAllEventCategoryTagsSchema 
} = require('../../../validators/event_category_tags.validator');

// Create event category tags with auth
router.post('/create', auth, validateBody(createEventCategoryTagsSchema), createEventCategoryTags);

// Get all event category tags with auth
router.get('/getAll',  getAllEventCategoryTags);

// Get event category tags by ID with auth
router.get('/getById/:id', auth, validateParams(getEventCategoryTagsByIdSchema), getEventCategoryTagsById);

// Update event category tags by ID with auth
router.put('/updateById', auth, validateBody(updateEventCategoryTagsSchema), updateEventCategoryTags);

// Delete event category tags by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getEventCategoryTagsByIdSchema), deleteEventCategoryTags);

module.exports = router;
