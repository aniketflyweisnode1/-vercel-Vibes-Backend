const VendorBooking = require('../models/vendor_booking.model');
const Transaction = require('../models/transaction.model');
const VendorOnboardingPortal = require('../models/vendor_onboarding_portal.model');
const Wallet = require('../models/wallet.model');
const User = require('../models/user.model');
const { createRefund } = require('../../utils/stripe');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../utils/logger');

/**
 * Calculate refund amount based on cancellation charges and refund percentage
 * @param {Number} originalAmount - Original booking amount
 * @param {Number} cancellationCharges - Cancellation charges percentage (0-100)
 * @param {Number} refundPercentage - Refund percentage (0-100)
 * @returns {Object} Refund calculation details
 */
const calculateRefundAmount = (originalAmount, cancellationCharges = 0, refundPercentage = 100) => {
  // Calculate cancellation fee amount
  const cancellationFee = (originalAmount * cancellationCharges) / 100;
  
  // Calculate refund percentage after cancellation charges
  const effectiveRefundPercentage = Math.max(0, Math.min(100, refundPercentage));
  
  // Calculate refundable amount (original - cancellation fee)
  const refundableAmount = originalAmount - cancellationFee;
  
  // Calculate actual refund based on refund percentage
  const refundAmount = (refundableAmount * effectiveRefundPercentage) / 100;
  
  // Amount retained by vendor/platform
  const retainedAmount = originalAmount - refundAmount;
  
  return {
    originalAmount,
    cancellationCharges,
    cancellationFee,
    refundPercentage: effectiveRefundPercentage,
    refundAmount: Math.round(refundAmount * 100) / 100, // Round to 2 decimal places
    retainedAmount: Math.round(retainedAmount * 100) / 100,
    refundableAmount: Math.round(refundableAmount * 100) / 100
  };
};

/**
 * Cancel vendor booking with refund calculation and processing (Unified API)
 * This API handles: refund calculation, booking cancellation, and refund processing in one flow
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelVendorBookingWithRefund = asyncHandler(async (req, res) => {
  try {
    const { vendor_booking_id, cancellation_reason, process_refund = true } = req.body;
    const userId = req.userId;

    // Find the booking
    const booking = await VendorBooking.findOne({ 
      Vendor_Booking_id: parseInt(vendor_booking_id) 
    });

    if (!booking) {
      return sendNotFound(res, 'Vendor booking not found');
    }

    // Check if booking is already cancelled
    if (booking.vender_booking_status === 'cancelled') {
      return sendError(res, 'Booking is already cancelled', 400);
    }

    // Check if booking belongs to the user or user is admin
    if (booking.user_id !== userId && booking.vendor_id !== userId) {
      // Check if user is admin (you may need to adjust this based on your role system)
      const user = await User.findOne({ user_id: userId });
      if (!user || user.role_id !== 1) { // Assuming 1 is admin role_id
        return sendError(res, 'Unauthorized: You can only cancel your own bookings', 403);
      }
    }

    // Get vendor onboarding portal to retrieve cancellation terms
    let cancellationCharges = 0;
    let refundPercentage = 100;
    let cancellationPolicy = null;

    if (booking.vendor_id) {
      const vendorPortal = await VendorOnboardingPortal.findOne({
        Vendor_id: booking.vendor_id,
        Status: true
      });

      if (vendorPortal) {
        cancellationCharges = vendorPortal.CancellationCharges || 0;
        refundPercentage = vendorPortal.refund_percentage !== undefined ? vendorPortal.refund_percentage : 100;
        cancellationPolicy = vendorPortal.cancellation_policy;
      }
    }

    // Get original transaction
    let originalTransaction = null;
    let refundCalculation = null;
    let refundTransaction = null;

    if (booking.transaction_id) {
      originalTransaction = await Transaction.findOne({
        transaction_id: booking.transaction_id
      });

      if (originalTransaction && originalTransaction.status === 'completed') {
        // Calculate refund amount
        refundCalculation = calculateRefundAmount(
          originalTransaction.amount,
          cancellationCharges,
          refundPercentage
        );

        // Process refund if requested and refund amount > 0
        if (process_refund && refundCalculation.refundAmount > 0) {
          try {
            // Check if payment was made via Stripe (check metadata or payment method)
            const paymentMethod = originalTransaction.payment_method_id;
            
            // If Stripe payment, process refund via Stripe
            // Note: You'll need to store payment_intent_id in transaction metadata for Stripe refunds
            if (originalTransaction.metadata) {
              try {
                const metadata = JSON.parse(originalTransaction.metadata);
                if (metadata.payment_intent_id) {
                  const stripeRefund = await createRefund(
                    metadata.payment_intent_id,
                    refundCalculation.refundAmount,
                    cancellation_reason || 'Booking cancellation'
                  );

                  if (stripeRefund.success) {
                    // Create refund transaction record
                    refundTransaction = await Transaction.create({
                      user_id: booking.user_id,
                      amount: refundCalculation.refundAmount,
                      status: 'completed',
                      payment_method_id: paymentMethod,
                      transactionType: 'Refund',
                      vendor_booking_id: booking.Vendor_Booking_id,
                      original_transaction_id: originalTransaction.transaction_id,
                      refund_reason: cancellation_reason || 'Booking cancellation',
                      reference_number: `REF-${originalTransaction.reference_number || originalTransaction.transaction_id}`,
                      metadata: JSON.stringify({
                        refund_id: stripeRefund.refundId,
                        original_transaction_id: originalTransaction.transaction_id,
                        cancellation_reason: cancellation_reason
                      }),
                      created_by: userId,
                      created_at: new Date()
                    });

                    // Update original transaction status
                    if (refundCalculation.refundAmount === originalTransaction.amount) {
                      originalTransaction.status = 'refunded';
                    } else {
                      originalTransaction.status = 'partially_refunded';
                    }
                    originalTransaction.updated_by = userId;
                    originalTransaction.updated_at = new Date();
                    await originalTransaction.save();

                    // Update user wallet (add refund amount)
                    const wallet = await Wallet.findOne({ user_id: booking.user_id });
                    if (wallet) {
                      wallet.amount = (wallet.amount || 0) + refundCalculation.refundAmount;
                      wallet.updated_by = userId;
                      wallet.updated_at = new Date();
                      await wallet.save();
                    }
                  }
                }
              } catch (metadataError) {
                logger.error('Error processing Stripe refund:', metadataError);
                // Continue with manual refund transaction creation
              }
            }

            // If no Stripe refund was processed, create a manual refund transaction
            if (!refundTransaction) {
              refundTransaction = await Transaction.create({
                user_id: booking.user_id,
                amount: refundCalculation.refundAmount,
                status: 'pending', // Manual processing required
                payment_method_id: paymentMethod,
                transactionType: 'Refund',
                vendor_booking_id: booking.Vendor_Booking_id,
                original_transaction_id: originalTransaction.transaction_id,
                refund_reason: cancellation_reason || 'Booking cancellation',
                reference_number: `REF-${originalTransaction.reference_number || originalTransaction.transaction_id}`,
                metadata: JSON.stringify({
                  original_transaction_id: originalTransaction.transaction_id,
                  cancellation_reason: cancellation_reason,
                  manual_refund: true
                }),
                created_by: userId,
                created_at: new Date()
              });

              // Update user wallet (add refund amount)
              const wallet = await Wallet.findOne({ user_id: booking.user_id });
              if (wallet) {
                wallet.amount = (wallet.amount || 0) + refundCalculation.refundAmount;
                wallet.updated_by = userId;
                wallet.updated_at = new Date();
                await wallet.save();
              }
            }
          } catch (refundError) {
            logger.error('Error processing refund:', refundError);
            // Continue with cancellation even if refund fails
          }
        }
      }
    }

    // Update booking status
    const updateData = {
      vender_booking_status: 'cancelled',
      amount_status: 'cancelled',
      vendor_amount_status: 'cancelled',
      cancellation_reason: cancellation_reason || null,
      cancelled_at: new Date(),
      cancelled_by: userId,
      UpdatedBy: userId,
      UpdatedAt: new Date()
    };

    if (refundCalculation) {
      updateData.refund_amount = refundCalculation.refundAmount;
      updateData.refund_status = refundTransaction && refundTransaction.status === 'completed' ? 'processed' : 'pending';
      if (refundTransaction) {
        updateData.refund_transaction_id = refundTransaction.transaction_id;
      }
    }

    const cancelledBooking = await VendorBooking.findOneAndUpdate(
      { Vendor_Booking_id: parseInt(vendor_booking_id) },
      updateData,
      { new: true, runValidators: true }
    );

    // Populate booking details
    const bookingObj = cancelledBooking.toObject();
    if (cancelledBooking.user_id) {
      const bookingUser = await User.findOne({ user_id: cancelledBooking.user_id }).select('user_id name email mobile');
      bookingObj.user_details = bookingUser || null;
    }
    if (cancelledBooking.vendor_id) {
      const vendor = await User.findOne({ user_id: cancelledBooking.vendor_id }).select('user_id name email mobile role_id');
      bookingObj.vendor_details = vendor || null;
    }

    sendSuccess(res, {
      booking: bookingObj,
      refund_calculation: refundCalculation,
      refund_transaction: refundTransaction ? {
        transaction_id: refundTransaction.transaction_id,
        amount: refundTransaction.amount,
        status: refundTransaction.status,
        reference_number: refundTransaction.reference_number
      } : null,
      cancellation_terms: {
        cancellation_charges: cancellationCharges,
        refund_percentage: refundPercentage,
        cancellation_policy: cancellationPolicy
      }
    }, 'Vendor booking cancelled successfully');
  } catch (error) {
    logger.error('Error cancelling vendor booking:', error);
    throw error;
  }
});

/**
 * Get refund calculation for a booking (without cancelling)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRefundCalculation = asyncHandler(async (req, res) => {
  try {
    const { vendor_booking_id } = req.params;
    const userId = req.userId;

    // Find the booking
    const booking = await VendorBooking.findOne({ 
      Vendor_Booking_id: parseInt(vendor_booking_id) 
    });

    if (!booking) {
      return sendNotFound(res, 'Vendor booking not found');
    }

    // Check if booking belongs to the user
    if (booking.user_id !== userId && booking.vendor_id !== userId) {
      const user = await User.findOne({ user_id: userId });
      if (!user || user.role_id !== 1) {
        return sendError(res, 'Unauthorized: You can only view refund calculations for your own bookings', 403);
      }
    }

    // Get vendor onboarding portal to retrieve cancellation terms
    let cancellationCharges = 0;
    let refundPercentage = 100;
    let cancellationPolicy = null;

    if (booking.vendor_id) {
      const vendorPortal = await VendorOnboardingPortal.findOne({
        Vendor_id: booking.vendor_id,
        Status: true
      });

      if (vendorPortal) {
        cancellationCharges = vendorPortal.CancellationCharges || 0;
        refundPercentage = vendorPortal.refund_percentage !== undefined ? vendorPortal.refund_percentage : 100;
        cancellationPolicy = vendorPortal.cancellation_policy;
      }
    }

    // Get original transaction
    let refundCalculation = null;
    let originalTransaction = null;

    if (booking.transaction_id) {
      originalTransaction = await Transaction.findOne({
        transaction_id: booking.transaction_id
      });

      if (originalTransaction && originalTransaction.status === 'completed') {
        refundCalculation = calculateRefundAmount(
          originalTransaction.amount,
          cancellationCharges,
          refundPercentage
        );
      }
    }

    sendSuccess(res, {
      booking_id: booking.Vendor_Booking_id,
      booking_status: booking.vender_booking_status,
      original_transaction: originalTransaction ? {
        transaction_id: originalTransaction.transaction_id,
        amount: originalTransaction.amount,
        status: originalTransaction.status
      } : null,
      refund_calculation: refundCalculation,
      cancellation_terms: {
        cancellation_charges: cancellationCharges,
        refund_percentage: refundPercentage,
        cancellation_policy: cancellationPolicy
      }
    }, 'Refund calculation retrieved successfully');
  } catch (error) {
    logger.error('Error getting refund calculation:', error);
    throw error;
  }
});

/**
 * Process refund for a cancelled booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processRefund = asyncHandler(async (req, res) => {
  try {
    const { vendor_booking_id, refund_amount } = req.body;
    const userId = req.userId;

    // Find the booking
    const booking = await VendorBooking.findOne({ 
      Vendor_Booking_id: parseInt(vendor_booking_id) 
    });

    if (!booking) {
      return sendNotFound(res, 'Vendor booking not found');
    }

    // Check if booking is cancelled
    if (booking.vender_booking_status !== 'cancelled') {
      return sendError(res, 'Booking must be cancelled before processing refund', 400);
    }

    // Check if refund already processed
    if (booking.refund_status === 'processed') {
      return sendError(res, 'Refund has already been processed', 400);
    }

    // Get original transaction
    if (!booking.transaction_id) {
      return sendError(res, 'No transaction found for this booking', 400);
    }

    const originalTransaction = await Transaction.findOne({
      transaction_id: booking.transaction_id
    });

    if (!originalTransaction) {
      return sendNotFound(res, 'Original transaction not found');
    }

    // Use provided refund amount or booking refund amount
    const refundAmount = refund_amount || booking.refund_amount || 0;

    if (refundAmount <= 0) {
      return sendError(res, 'Invalid refund amount', 400);
    }

    if (refundAmount > originalTransaction.amount) {
      return sendError(res, 'Refund amount cannot exceed original transaction amount', 400);
    }

    // Process refund
    let refundTransaction = null;
    try {
      // Check if payment was made via Stripe
      if (originalTransaction.metadata) {
        try {
          const metadata = JSON.parse(originalTransaction.metadata);
          if (metadata.payment_intent_id) {
            const stripeRefund = await createRefund(
              metadata.payment_intent_id,
              refundAmount,
              booking.cancellation_reason || 'Booking cancellation refund'
            );

            if (stripeRefund.success) {
              // Create refund transaction record
              refundTransaction = await Transaction.create({
                user_id: booking.user_id,
                amount: refundAmount,
                status: 'completed',
                payment_method_id: originalTransaction.payment_method_id,
                transactionType: 'Refund',
                vendor_booking_id: booking.Vendor_Booking_id,
                original_transaction_id: originalTransaction.transaction_id,
                refund_reason: booking.cancellation_reason || 'Booking cancellation refund',
                reference_number: `REF-${originalTransaction.reference_number || originalTransaction.transaction_id}`,
                metadata: JSON.stringify({
                  refund_id: stripeRefund.refundId,
                  original_transaction_id: originalTransaction.transaction_id
                }),
                created_by: userId,
                created_at: new Date()
              });

              // Update original transaction status
              if (refundAmount === originalTransaction.amount) {
                originalTransaction.status = 'refunded';
              } else {
                originalTransaction.status = 'partially_refunded';
              }
              originalTransaction.updated_by = userId;
              originalTransaction.updated_at = new Date();
              await originalTransaction.save();
            }
          }
        } catch (metadataError) {
          logger.error('Error processing Stripe refund:', metadataError);
        }
      }

      // If no Stripe refund, create manual refund transaction
      if (!refundTransaction) {
        refundTransaction = await Transaction.create({
          user_id: booking.user_id,
          amount: refundAmount,
          status: 'pending', // Manual processing required
          payment_method_id: originalTransaction.payment_method_id,
          transactionType: 'Refund',
          vendor_booking_id: booking.Vendor_Booking_id,
          original_transaction_id: originalTransaction.transaction_id,
          refund_reason: booking.cancellation_reason || 'Booking cancellation refund',
          reference_number: `REF-${originalTransaction.reference_number || originalTransaction.transaction_id}`,
          metadata: JSON.stringify({
            original_transaction_id: originalTransaction.transaction_id,
            manual_refund: true
          }),
          created_by: userId,
          created_at: new Date()
        });
      }

      // Update user wallet
      const wallet = await Wallet.findOne({ user_id: booking.user_id });
      if (wallet) {
        wallet.amount = (wallet.amount || 0) + refundAmount;
        wallet.updated_by = userId;
        wallet.updated_at = new Date();
        await wallet.save();
      }

      // Update booking refund status
      booking.refund_status = refundTransaction.status === 'completed' ? 'processed' : 'pending';
      booking.refund_transaction_id = refundTransaction.transaction_id;
      booking.refund_amount = refundAmount;
      booking.UpdatedBy = userId;
      booking.UpdatedAt = new Date();
      await booking.save();

      sendSuccess(res, {
        booking_id: booking.Vendor_Booking_id,
        refund_transaction: {
          transaction_id: refundTransaction.transaction_id,
          amount: refundTransaction.amount,
          status: refundTransaction.status,
          reference_number: refundTransaction.reference_number
        },
        refund_status: booking.refund_status
      }, 'Refund processed successfully');
    } catch (refundError) {
      logger.error('Error processing refund:', refundError);
      throw new Error(`Refund processing failed: ${refundError.message}`);
    }
  } catch (error) {
    logger.error('Error in processRefund:', error);
    throw error;
  }
});

/**
 * Cancel vendor booking and process refund (Legacy - kept for backward compatibility)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const cancelVendorBooking = cancelVendorBookingWithRefund;

/**
 * Reschedule vendor booking - Apply cancellation charges and update booking date/time
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const rescheduleVendorBooking = asyncHandler(async (req, res) => {
  try {
    const { 
      vendor_booking_id, 
      Date_start, 
      End_date, 
      Start_time, 
      End_time,
      Year,
      Month,
      reschedule_reason 
    } = req.body;
    const userId = req.userId;

    // Find the booking
    const booking = await VendorBooking.findOne({ 
      Vendor_Booking_id: parseInt(vendor_booking_id) 
    });

    if (!booking) {
      return sendNotFound(res, 'Vendor booking not found');
    }

    // Check if booking is already cancelled
    if (booking.vender_booking_status === 'cancelled') {
      return sendError(res, 'Cannot reschedule a cancelled booking', 400);
    }

    // Check if booking belongs to the user or user is admin
    if (booking.user_id !== userId && booking.vendor_id !== userId) {
      const user = await User.findOne({ user_id: userId });
      if (!user || user.role_id !== 1) {
        return sendError(res, 'Unauthorized: You can only reschedule your own bookings', 403);
      }
    }

    // Get vendor onboarding portal to retrieve cancellation terms
    let cancellationCharges = 0;
    let cancellationPolicy = null;

    if (booking.vendor_id) {
      const vendorPortal = await VendorOnboardingPortal.findOne({
        Vendor_id: booking.vendor_id,
        Status: true
      });

      if (vendorPortal) {
        cancellationCharges = vendorPortal.CancellationCharges || 0;
        cancellationPolicy = vendorPortal.cancellation_policy;
      }
    }

    // Get original transaction
    let originalTransaction = null;
    let cancellationFee = 0;
    let rescheduleTransaction = null;

    if (booking.transaction_id) {
      originalTransaction = await Transaction.findOne({
        transaction_id: booking.transaction_id
      });

      if (originalTransaction && originalTransaction.status === 'completed') {
        // Calculate cancellation fee (charges for rescheduling)
        cancellationFee = (originalTransaction.amount * cancellationCharges) / 100;
        cancellationFee = Math.round(cancellationFee * 100) / 100;

        // Create transaction for cancellation charges if fee > 0
        if (cancellationFee > 0) {
          try {
            const paymentMethod = originalTransaction.payment_method_id;

            rescheduleTransaction = await Transaction.create({
              user_id: booking.user_id,
              amount: cancellationFee,
              status: 'completed',
              payment_method_id: paymentMethod,
              transactionType: 'Cancellation',
              vendor_booking_id: booking.Vendor_Booking_id,
              original_transaction_id: originalTransaction.transaction_id,
              refund_reason: reschedule_reason || 'Booking reschedule charges',
              reference_number: `RESCHEDULE-${originalTransaction.reference_number || originalTransaction.transaction_id}`,
              metadata: JSON.stringify({
                original_transaction_id: originalTransaction.transaction_id,
                reschedule_reason: reschedule_reason || 'Booking reschedule',
                cancellation_charges_percentage: cancellationCharges,
                type: 'reschedule_charges'
              }),
              created_by: userId,
              created_at: new Date()
            });

            // Deduct cancellation fee from user wallet
            const wallet = await Wallet.findOne({ user_id: booking.user_id });
            if (wallet) {
              const newAmount = Math.max(0, (wallet.amount || 0) - cancellationFee);
              wallet.amount = newAmount;
              wallet.updated_by = userId;
              wallet.updated_at = new Date();
              await wallet.save();
            }
          } catch (transactionError) {
            logger.error('Error creating reschedule charges transaction:', transactionError);
            // Continue with reschedule even if transaction creation fails
          }
        }
      }
    }

    // Prepare update data for booking
    const updateData = {
      vender_booking_status: 'rescheduled',
      amount_status: 'rescheduled',
      vendor_amount_status: 'rescheduled',
      UpdatedBy: userId,
      UpdatedAt: new Date()
    };

    // Update date/time fields if provided
    if (Date_start) {
      const newDateStart = new Date(Date_start);
      updateData.Date_start = newDateStart;
      
      // Extract Year and Month from new date if not provided
      if (!Year) {
        updateData.Year = newDateStart.getFullYear();
      }
      if (!Month) {
        updateData.Month = newDateStart.getMonth() + 1; // Month is 0-indexed in JS
      }
    }

    if (Year) {
      updateData.Year = parseInt(Year);
    }
    if (Month) {
      const monthNum = parseInt(Month);
      if (monthNum < 1 || monthNum > 12) {
        return sendError(res, 'Month must be between 1 and 12', 400);
      }
      updateData.Month = monthNum;
    }

    if (End_date) {
      updateData.End_date = new Date(End_date);
    }

    if (Start_time !== undefined) {
      updateData.Start_time = Start_time;
    }

    if (End_time !== undefined) {
      updateData.End_time = End_time;
    }

    // Update booking
    const rescheduledBooking = await VendorBooking.findOneAndUpdate(
      { Vendor_Booking_id: parseInt(vendor_booking_id) },
      updateData,
      { new: true, runValidators: true }
    );

    // Populate booking details
    const bookingObj = rescheduledBooking.toObject();
    if (rescheduledBooking.user_id) {
      const bookingUser = await User.findOne({ user_id: rescheduledBooking.user_id }).select('user_id name email mobile');
      bookingObj.user_details = bookingUser || null;
    }
    if (rescheduledBooking.vendor_id) {
      const vendor = await User.findOne({ user_id: rescheduledBooking.vendor_id }).select('user_id name email mobile role_id');
      bookingObj.vendor_details = vendor || null;
    }

    sendSuccess(res, {
      booking: bookingObj,
      reschedule_charges: {
        cancellation_charges_percentage: cancellationCharges,
        cancellation_fee: cancellationFee,
        original_amount: originalTransaction ? originalTransaction.amount : booking.amount
      },
      reschedule_transaction: rescheduleTransaction ? {
        transaction_id: rescheduleTransaction.transaction_id,
        amount: rescheduleTransaction.amount,
        status: rescheduleTransaction.status,
        reference_number: rescheduleTransaction.reference_number
      } : null,
      cancellation_terms: {
        cancellation_charges: cancellationCharges,
        cancellation_policy: cancellationPolicy
      }
    }, 'Vendor booking rescheduled successfully');
  } catch (error) {
    logger.error('Error rescheduling vendor booking:', error);
    throw error;
  }
});

module.exports = {
  cancelVendorBookingWithRefund,
  cancelVendorBooking, // Legacy support
  getRefundCalculation,
  processRefund,
  rescheduleVendorBooking
};

