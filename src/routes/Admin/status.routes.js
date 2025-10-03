const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createStatus, 
  getAllStatuses, 
  getStatusById, 
  updateStatus,
  updateAllStatuses 
} = require('../../controllers/status.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createStatusSchema, 
  updateStatusSchema, 
  updateAllStatusesSchema,
  getStatusByIdSchema, 
  getAllStatusesSchema 
} = require('../../../validators/status.validator');

// Create status with auth
router.post('/create', auth, validateBody(createStatusSchema), createStatus);

// Get all statuses with auth
router.get('/getAll', auth, validateQuery(getAllStatusesSchema), getAllStatuses);

// Get status by ID with auth
router.get('/getById/:id', auth, validateParams(getStatusByIdSchema), getStatusById);

// Update status by ID with auth
router.put('/updateById', auth, validateBody(updateStatusSchema), updateStatus);

// Update all statuses with auth
router.put('/updateAll', auth, validateBody(updateAllStatusesSchema), updateAllStatuses);

module.exports = router;
