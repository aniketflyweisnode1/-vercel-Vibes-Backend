const express = require('express');
const router = express.Router();

const { 
  createMarketPlaceBooking, 
  getAllMarketPlaceBooking, 
  getMarketPlaceBookingById, 
  getMarketPlaceBookingByAuth, 
  updateMarketPlaceBooking, 
  deleteMarketPlaceBooking 
} = require('../../controllers/marketplace_booking.controller');

const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { 
  createMarketPlaceBookingSchema, 
  updateMarketPlaceBookingSchema, 
  getMarketPlaceBookingByIdSchema, 
  getAllMarketPlaceBookingSchema 
} = require('../../../validators/marketplace_booking.validator');

// Create marketplace booking (with auth)
router.post('/create', auth, validateBody(createMarketPlaceBookingSchema), createMarketPlaceBooking);

// Get all marketplace bookings
router.get('/getAll',  getAllMarketPlaceBooking);

// Get marketplace booking by ID (with auth)
router.get('/getMarketPlaceBookingById/:id', auth, validateParams(getMarketPlaceBookingByIdSchema), getMarketPlaceBookingById);

// Get marketplace booking by authenticated user (with auth)
router.get('/getMarketPlaceBookingByAuth', auth, getMarketPlaceBookingByAuth);

// Update marketplace booking by ID (with auth)
router.put('/updateMarketPlaceBookingById', auth, validateBody(updateMarketPlaceBookingSchema), updateMarketPlaceBooking);

// Delete marketplace booking by ID (with auth)
router.delete('/deleteMarketPlaceBookingById/:id', auth, validateParams(getMarketPlaceBookingByIdSchema), deleteMarketPlaceBooking);

module.exports = router;

