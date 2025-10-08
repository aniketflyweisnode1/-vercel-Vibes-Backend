const express = require('express');
const router = express.Router();

// Import controller
const {
  createOTP,
  getAllOTPs,
  getOTPById,
  updateOTP,
  deleteOTP
} = require('../../controllers/otp.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createOTPSchema, 
  updateOTPSchema, 
  getOTPByIdSchema 
} = require('../../../validators/otp.validator');

/**
 * @route   POST /api/admin/otps
 * @desc    Create a new OTP
 * @access  Private (Admin)
 */
router.post('/', auth, validateBody(createOTPSchema), createOTP);

/**
 * @route   GET /api/admin/otps
 * @desc    Get all OTPs with pagination and filtering
 * @access  Private (Admin)
 */
router.get('/', auth, getAllOTPs);

/**
 * @route   GET /api/admin/otps/:id
 * @desc    Get OTP by ID
 * @access  Private (Admin)
 */
router.get('/:id', auth, validateParams(getOTPByIdSchema), getOTPById);

/**
 * @route   PUT /api/admin/otps/:id
 * @desc    Update OTP by ID
 * @access  Private (Admin)
 */
router.put('/:id', auth, validateBody(updateOTPSchema), updateOTP);

/**
 * @route   DELETE /api/admin/otps/:id
 * @desc    Delete OTP by ID
 * @access  Private (Admin)
 */
router.delete('/:id', auth, validateParams(getOTPByIdSchema), deleteOTP);

module.exports = router;
