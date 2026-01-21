const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validate } = require('../../../middleware/validation');
const { createStaffSchema, updateStaffSchema, getStaffByIdSchema, getStaffByCategoryIdSchema, deleteStaffSchema } = require('../../../validators/staff.validator');
const { createStaff, getAllStaff, getStaffById, getStaffByCategoryId, getStaffByUserId, updateStaff, deleteStaff, getStaffStatistics, createStaffForUser, getStaffInfoForUser, checkUserIsStaff, getStaffStatisticsForUser, getFieldMappings } = require('../../controllers/corporateStaff.controller');
// Create staff (with auth)
router.post('/create', auth, createStaff);
// Get all staff (with pagination, search, filters)
router.get('/getAll', auth, getAllStaff);
// Get staff by ID
router.get('/getById/:id', validate(getStaffByIdSchema, 'params'), getStaffById);
// Get staff by category ID
router.get('/getByCategoryId/:id', validate(getStaffByCategoryIdSchema, 'params'), getStaffByCategoryId);
// Get staff by user ID (staff_id)
router.get('/getByUserId/:id', validate(getStaffByIdSchema, 'params'), getStaffByUserId);
// Update staff (with auth)
router.put('/update', auth, validate(updateStaffSchema), updateStaff);
// Delete staff (with auth)
router.delete('/delete/:id', auth, validate(deleteStaffSchema, 'params'), deleteStaff);
// Get staff statistics
router.get('/statistics', getStaffStatistics);
// Create staff for user using static method (with auth)
router.post('/createForUser', auth, validate(createStaffSchema), createStaffForUser);
// Get staff info for a specific user
router.get('/getStaffInfoForUser/:id', validate(getStaffByIdSchema, 'params'), getStaffInfoForUser);
// Check if user is staff
router.get('/checkUserIsStaff/:id', validate(getStaffByIdSchema, 'params'), checkUserIsStaff);
// Get staff statistics for a specific user
router.get('/getStaffStatisticsForUser/:id', validate(getStaffByIdSchema, 'params'), getStaffStatisticsForUser);
// Get field mappings for documentation
router.get('/fieldMappings', getFieldMappings);
module.exports = router;
