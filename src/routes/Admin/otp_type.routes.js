const express = require('express');
const router = express.Router();

// Import controller
const {
  createOtpType,
  getAllOtpTypes,
  getOtpTypeById,
  updateOtpType,
  deleteOtpType,
  getOtpTypesByAuth
} = require('../../controllers/otp_type.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createOtpTypeSchema, 
  updateOtpTypeSchema, 
  getOtpTypeByIdSchema 
} = require('../../../validators/otp_type.validator');

/**
 * @route   POST /api/admin/otp-types
 * @desc    Create a new OTP type
 * @access  Private (Admin)
 */
router.post('/', auth, validateBody(createOtpTypeSchema), createOtpType);

/**
 * @route   GET /api/admin/otp-types
 * @desc    Get all OTP types with pagination and filtering
 * @access  Private (Admin)
 */
router.get('/', auth, getAllOtpTypes);

/**
 * @route   GET /api/admin/otp-types/auth
 * @desc    Get OTP types created by authenticated user
 * @access  Private (Admin)
 */
router.get('/auth', auth, getOtpTypesByAuth);

/**
 * @route   GET /api/admin/otp-types/:id
 * @desc    Get OTP type by ID
 * @access  Private (Admin)
 */
router.get('/:id', auth, validateParams(getOtpTypeByIdSchema), getOtpTypeById);

/**
 * @route   PUT /api/admin/otp-types/:id
 * @desc    Update OTP type by ID
 * @access  Private (Admin)
 */
router.put('/:id', auth, validateBody(updateOtpTypeSchema), updateOtpType);

/**
 * @route   DELETE /api/admin/otp-types/:id
 * @desc    Delete OTP type by ID (soft delete)
 * @access  Private (Admin)
 */
router.delete('/:id', auth, validateParams(getOtpTypeByIdSchema), deleteOtpType);

module.exports = router;
