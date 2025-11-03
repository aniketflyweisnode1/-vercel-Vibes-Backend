const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createCateringMarketplaceBooking, 
  getAllCateringMarketplaceBookings, 
  getCateringMarketplaceBookingById, 
  updateCateringMarketplaceBooking, 
  deleteCateringMarketplaceBooking,
  CateringMarketplaceBookingPayment,
  getCateringBookingsByAuth
} = require('../../controllers/catering_marketplace_booking.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createCateringMarketplaceBookingSchema, 
  updateCateringMarketplaceBookingSchema, 
  getCateringMarketplaceBookingByIdSchema
} = require('../../../validators/catering_marketplace_booking.validator');

// Create catering marketplace booking with auth (creates event and transaction)
router.post('/create', auth, validateBody(createCateringMarketplaceBookingSchema), createCateringMarketplaceBooking);

// Get all catering marketplace bookings (no auth, no validation)
router.get('/getAll', getAllCateringMarketplaceBookings);

// Get catering marketplace booking by ID with auth
router.get('/getById/:id', auth, validateParams(getCateringMarketplaceBookingByIdSchema), getCateringMarketplaceBookingById);

// Update catering marketplace booking with auth
router.put('/update', auth, validateBody(updateCateringMarketplaceBookingSchema), updateCateringMarketplaceBooking);

// Delete catering marketplace booking by ID with auth
router.delete('/delete/:id', auth, validateParams(getCateringMarketplaceBookingByIdSchema), deleteCateringMarketplaceBooking);

// Get all catering bookings by authenticated user
// Support both route names for backward compatibility
router.get('/getCateringBookingsByAuth', auth, getCateringBookingsByAuth);
router.get('/CateringBookingsByAuth', auth, getCateringBookingsByAuth);

// Catering marketplace booking payment
router.post('/cateringBookingPayment', auth, CateringMarketplaceBookingPayment);
module.exports = router;
