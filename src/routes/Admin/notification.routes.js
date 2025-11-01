const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createNotification, 
  createNotificationByRoleId, 
  createNotificationSendAll, 
  getAllNotifications, 
  getNotificationById, 
  updateNotification, 
  deleteNotification,
  getNotificationsByAuth
} = require('../../controllers/notification.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createNotificationSchema, 
  createNotificationByRoleIdSchema, 
  createNotificationSendAllSchema, 
  updateNotificationSchema, 
  getNotificationByIdSchema, 
  getAllNotificationsSchema,
  getNotificationsByAuthSchema
} = require('../../../validators/notification.validator');

// Create notification (with auth)
router.post('/create', auth, validateBody(createNotificationSchema), createNotification);

// Create notification by role ID (with auth)
router.post('/createByRoleId', auth, validateBody(createNotificationByRoleIdSchema), createNotificationByRoleId);

// Create notification send all (with auth)
router.post('/createSendAll', auth, validateBody(createNotificationSendAllSchema), createNotificationSendAll);

// Get all notifications (with auth)
router.get('/getAll', auth, validateQuery(getAllNotificationsSchema), getAllNotifications);

// Get notifications by authenticated user (with auth)
router.get('/getByAuth', auth, validateQuery(getNotificationsByAuthSchema), getNotificationsByAuth);

// Get notification by ID (with auth)
router.get('/getNotificationById/:id', auth, validateParams(getNotificationByIdSchema), getNotificationById);

// Update notification by ID (with auth)
router.put('/updateNotificationById', auth, validateBody(updateNotificationSchema), updateNotification);

// Delete notification by ID (with auth)
router.delete('/deleteNotificationById/:id', auth, validateParams(getNotificationByIdSchema), deleteNotification);

module.exports = router;
