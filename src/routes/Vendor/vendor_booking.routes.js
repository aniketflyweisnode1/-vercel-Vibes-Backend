const express = require('express');
const router = express.Router();

const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../../../middleware/validation');
const {
  createVendorBookingSchema,
  updateVendorBookingSchema,
  getVendorBookingByIdSchema,
  queryVendorBookingSchema
} = require('../../../validators/vendor_booking.validator');
const {
  createVendorBooking,
  getAllVendorBookings,
  getVendorBookingById,
  updateVendorBooking,
  deleteVendorBooking,
  getVendorBookingsByAuth,
  VendorBookingPayment
} = require('../../controllers/vendor_booking.controller');

// Create vendor booking (with auth)
router.post('/create', auth, validateBody(createVendorBookingSchema), createVendorBooking);

// Get all vendor bookings
router.get('/getAll', validateQuery(queryVendorBookingSchema), getAllVendorBookings);

// Get vendor bookings for authenticated user
router.get('/getByAuth', auth, validateQuery(queryVendorBookingSchema), getVendorBookingsByAuth);

// Get vendor booking by ID (with auth)
router.get('/getById/:id', auth, validateParams(getVendorBookingByIdSchema), getVendorBookingById);

// Update vendor booking (with auth)
router.put('/update', auth, validateBody(updateVendorBookingSchema), updateVendorBooking);

// Delete vendor booking (with auth)
router.delete('/delete/:id', auth, validateParams(getVendorBookingByIdSchema), deleteVendorBooking);

// Staff booking payment (with auth)
router.post('/payment', auth, VendorBookingPayment);

module.exports = router;