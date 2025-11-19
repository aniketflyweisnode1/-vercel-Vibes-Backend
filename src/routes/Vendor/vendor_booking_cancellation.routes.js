const express = require('express');
const router = express.Router();

// Import controllers
const {
  cancelVendorBookingWithRefund,
  cancelVendorBooking,
  getRefundCalculation,
  processRefund,
  rescheduleVendorBooking
} = require('../../controllers/vendor_booking_cancellation.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateParams } = require('../../../middleware/validation');

// Import validators
const {
  cancelVendorBookingSchema,
  getRefundCalculationParamsSchema,
  processRefundSchema,
  rescheduleVendorBookingSchema
} = require('../../../validators/vendor_booking_cancellation.validator');

/**
 * @route   GET /api/vendor/bookings/calculation/:vendor_booking_id
 * @desc    Get refund calculation for a booking (without cancelling)
 * @access  Private
 */
router.get('/calculation/:vendor_booking_id', auth, validateParams(getRefundCalculationParamsSchema), getRefundCalculation);

/**
 * @route   POST /api/vendor/bookings/cancel
 * @desc    Unified API: Cancel vendor booking, calculate refund (based on CancellationCharges %), and process refund in one flow
 * @access  Private
 * @body    {vendor_booking_id, cancellation_reason, process_refund}
 * @returns {booking, refund_calculation, refund_transaction, cancellation_terms}
 */
router.post('/VendorBooking/cancel', auth, validateBody(cancelVendorBookingSchema), cancelVendorBooking);

/**
 * @route   POST /api/vendor/bookings/reschedule
 * @desc    Reschedule vendor booking: Apply cancellation charges and update booking date/time
 * @access  Private
 * @body    {vendor_booking_id, Date_start, End_date, Start_time, End_time, Year, Month, reschedule_reason}
 * @returns {booking, reschedule_charges, reschedule_transaction, cancellation_terms}
 */
router.post('/reschedule', auth, validateBody(rescheduleVendorBookingSchema), rescheduleVendorBooking);

module.exports = router;

