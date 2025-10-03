const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createNotificationType, 
  getAllNotificationTypes, 
  getNotificationTypeById, 
  getNotificationTypeByAuth, 
  updateNotificationType, 
  deleteNotificationType 
} = require('../../controllers/notification_type.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createNotificationTypeSchema, 
  updateNotificationTypeSchema, 
  getNotificationTypeByIdSchema, 
  getAllNotificationTypesSchema 
} = require('../../../validators/notification_type.validator');

// Create notification type (with auth)
router.post('/create', auth, validateBody(createNotificationTypeSchema), createNotificationType);

// Get all notification types (with auth)
router.get('/getAll', auth, validateQuery(getAllNotificationTypesSchema), getAllNotificationTypes);

// Get notification type by ID (with auth)
router.get('/getNotificationTypeById/:id', auth, validateParams(getNotificationTypeByIdSchema), getNotificationTypeById);

// Get notification types by authenticated user (with auth)
router.get('/getNotificationTypeByAuth', auth, getNotificationTypeByAuth);

// Update notification type by ID (with auth)
router.put('/updateNotificationTypeById', auth, validateBody(updateNotificationTypeSchema), updateNotificationType);

// Delete notification type by ID (with auth)
router.delete('/deleteNotificationTypeById/:id', auth, validateParams(getNotificationTypeByIdSchema), deleteNotificationType);

module.exports = router;
