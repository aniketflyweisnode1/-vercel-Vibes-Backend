const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createStaffEventBook, 
  getAllStaffEventBooks, 
  getStaffEventBookById, 
  getStaffEventBooksByAuth,
  getStaffEventBooksByVendorId,
  updateStaffEventBook, 
  deleteStaffEventBook
} = require('../../controllers/staff_event_book.controller');

// Import transaction controller
const { createStaffBookingTransaction } = require('../../controllers/transaction.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createStaffEventBookSchema, 
  updateStaffEventBookSchema, 
  getStaffEventBookByIdSchema,
  getStaffEventBooksByVendorIdSchema
} = require('../../../validators/staff_event_book.validator');

const { createStaffBookingTransactionSchema } = require('../../../validators/transaction.validator');

// Create staff event booking with auth
router.post('/create', auth, validateBody(createStaffEventBookSchema), createStaffEventBook);

// Get all staff event bookings (no auth, no validation)
router.get('/getAll', getAllStaffEventBooks);

// Get staff event bookings by authenticated user with auth
router.get('/getByAuth', auth, getStaffEventBooksByAuth);

// Get staff event bookings by vendor ID with auth
router.get('/getStaffByVendorId', auth, validateParams(getStaffEventBooksByVendorIdSchema), getStaffEventBooksByVendorId);

// Get staff event booking by ID with auth
router.get('/getById/:id', auth, validateParams(getStaffEventBookByIdSchema), getStaffEventBookById);

// Update staff event booking with auth
router.put('/update', auth, validateBody(updateStaffEventBookSchema), updateStaffEventBook);

// Delete staff event booking by ID with auth
router.delete('/delete/:id', auth, validateParams(getStaffEventBookByIdSchema), deleteStaffEventBook);

// Create staff booking transaction (automatically sets transactionType to StaffBooking) with auth
router.post('/create-transaction', auth, validateBody(createStaffBookingTransactionSchema), createStaffBookingTransaction);

module.exports = router;

