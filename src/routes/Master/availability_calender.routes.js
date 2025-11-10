const express = require('express');
const router = express.Router();

const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../../../middleware/validation');
const {
  createAvailabilityCalenderSchema,
  updateAvailabilityCalenderSchema,
  getAvailabilityCalenderByIdSchema,
  queryAvailabilityCalenderSchema
} = require('../../../validators/availability_calender.validator');
const {
  createAvailabilityCalender,
  getAllAvailabilityCalenders,
  getAvailabilityCalenderById,
  updateAvailabilityCalender,
  deleteAvailabilityCalender,
  getAvailabilityCalendersByAuth
} = require('../../controllers/availability_calender.controller');

// Create availability calendar entry (with auth)
router.post('/create', auth, validateBody(createAvailabilityCalenderSchema), createAvailabilityCalender);

// Get all availability calendar entries
router.get('/getAll', validateQuery(queryAvailabilityCalenderSchema), getAllAvailabilityCalenders);

// Get availability calendar entries for authenticated user
router.get('/getByAuth', auth, validateQuery(queryAvailabilityCalenderSchema), getAvailabilityCalendersByAuth);

// Get availability calendar entry by ID (with auth)
router.get('/getById/:id', auth, validateParams(getAvailabilityCalenderByIdSchema), getAvailabilityCalenderById);

// Update availability calendar entry (with auth)
router.put('/update', auth, validateBody(updateAvailabilityCalenderSchema), updateAvailabilityCalender);

// Delete availability calendar entry (with auth)
router.delete('/delete/:id', auth, validateParams(getAvailabilityCalenderByIdSchema), deleteAvailabilityCalender);

module.exports = router;

