const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createServiceItem, 
  getAllServiceItems, 
  getServiceItemById, 
  updateServiceItem,
  deleteServiceItem
} = require('../../controllers/service_items.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createServiceItemSchema, 
  updateServiceItemSchema, 
  getServiceItemByIdSchema, 
  getAllServiceItemsSchema 
} = require('../../../validators/service_items.validator');

// Create service item with auth
router.post('/create', auth, validateBody(createServiceItemSchema), createServiceItem);

// Get all service items with auth
router.get('/getAll', auth, validateQuery(getAllServiceItemsSchema), getAllServiceItems);

// Get service item by ID with auth
router.get('/getById/:id', auth, validateParams(getServiceItemByIdSchema), getServiceItemById);

// Update service item by ID with auth
router.put('/updateById', auth, validateBody(updateServiceItemSchema), updateServiceItem);

// Delete service item by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getServiceItemByIdSchema), deleteServiceItem);

module.exports = router;
