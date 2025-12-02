const OTP = require('../src/models/otp.model');
const twilioService = require('./twilioService');
const emailService = require('./emailService');
const { generateOTP } = require('./helpers');
const logger = require('./logger');

/**
 * OTP Service - Unified service for sending and verifying OTPs via Email or SMS
 */
class OTPService {
  /**
   * Send OTP via Email or SMS
   * @param {Object} options - OTP sending options
   * @param {string} options.email - Email address (for email OTP)
   * @param {string} options.phone - Phone number (for SMS OTP)
   * @param {number} options.otpType - OTP type ID (required)
   * @param {number} options.userId - User ID who created the OTP (optional)
   * @param {number} options.expiresInMinutes - Expiration time in minutes (default: 10)
   * @param {string} options.messageTemplate - Custom message template for SMS (optional)
   * @returns {Promise<Object>} Result object with OTP details
   */
  async sendOTP(options = {}) {
    try {
      const {
        email,
        phone,
        otpType,
        userId = null,
        expiresInMinutes = 10,
        messageTemplate = null
      } = options;

      // Validate inputs
      if (!otpType) {
        return {
          success: false,
          error: 'OTP type is required',
          message: 'Please provide an OTP type'
        };
      }

      if (!email && !phone) {
        return {
          success: false,
          error: 'Email or phone number is required',
          message: 'Please provide either an email address or phone number'
        };
      }

      // Generate OTP
      const otpCode = generateOTP();

      // Calculate expiration time
      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

      // Deactivate any existing active OTPs for the same identifier and type
      const deactivateFilter = {
        otp_type: otpType,
        status: true
      };

      if (email) {
        deactivateFilter.email = email.toLowerCase();
      }

      await OTP.updateMany(
        deactivateFilter,
        {
          status: false,
          updated_at: new Date()
        }
      );

      // Create OTP record
      const otpData = {
        otp: otpCode,
        otp_type: otpType,
        status: true,
        expires_at: expiresAt,
        created_by: userId,
        is_used: false
      };

      if (email) {
        otpData.email = email.toLowerCase();
      }

      const otp = await OTP.create(otpData);

      // Send OTP via appropriate channel
      let sendResult = null;

      if (phone) {
        // Send via SMS using Twilio
        sendResult = await twilioService.sendOTPWithCode(phone, {
          messageTemplate: messageTemplate
        });

        if (!sendResult.success) {
          // If SMS fails, deactivate the OTP
          await OTP.findOneAndUpdate(
            { otp_id: otp.otp_id },
            { status: false, updated_at: new Date() }
          );
          return {
            success: false,
            error: sendResult.error,
            message: sendResult.message || 'Failed to send OTP via SMS'
          };
        }
      } else if (email) {
        // Send via Email
        const user = email.split('@')[0]; // Extract username from email
        const emailSent = await emailService.sendOTPEmail(email, otpCode, user);

        if (!emailSent) {
          // If email fails, deactivate the OTP
          await OTP.findOneAndUpdate(
            { otp_id: otp.otp_id },
            { status: false, updated_at: new Date() }
          );
          return {
            success: false,
            error: 'Email service error',
            message: 'Failed to send OTP email. Please try again.'
          };
        }
        sendResult = { success: true, message: 'OTP sent via email' };
      }

      return {
        success: true,
        otp_id: otp.otp_id,
        expiresIn: `${expiresInMinutes} minutes`,
        channel: phone ? 'SMS' : 'Email',
        message: sendResult.message || 'OTP sent successfully',
        // Only return OTP in development/testing - remove in production
        otp: process.env.NODE_ENV === 'development' ? otpCode : undefined
      };
    } catch (error) {
      logger.error('Failed to send OTP', {
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        error: error.message,
        message: 'Failed to send OTP'
      };
    }
  }

  /**
   * Verify OTP
   * @param {Object} options - OTP verification options
   * @param {string} options.email - Email address (for email OTP)
   * @param {string} options.otp - OTP code to verify
   * @param {number} options.otpType - OTP type ID (required)
   * @returns {Promise<Object>} Result object with verification status
   */
  async verifyOTP(options = {}) {
    try {
      const { email, otp, otpType } = options;

      // Validate inputs
      if (!otp || !otpType) {
        return {
          success: false,
          error: 'OTP and OTP type are required',
          message: 'Please provide OTP code and OTP type'
        };
      }

      if (!email) {
        return {
          success: false,
          error: 'Email is required',
          message: 'Please provide email address'
        };
      }

      // Find the OTP record
      const otpRecord = await OTP.findOne({
        email: email.toLowerCase(),
        otp: otp,
        otp_type: otpType,
        status: true
      }).sort({ created_at: -1 }); // Get the most recent OTP

      if (!otpRecord) {
        return {
          success: false,
          error: 'Invalid OTP',
          message: 'Invalid or expired OTP code'
        };
      }

      // Check if OTP is expired
      if (otpRecord.isExpired()) {
        await OTP.findOneAndUpdate(
          { otp_id: otpRecord.otp_id },
          {
            status: false,
            updated_at: new Date()
          }
        );
        return {
          success: false,
          error: 'OTP expired',
          message: 'OTP has expired. Please request a new one.'
        };
      }

      // Check if OTP is already used
      if (otpRecord.is_used) {
        return {
          success: false,
          error: 'OTP already used',
          message: 'This OTP has already been used'
        };
      }

      // Mark OTP as used
      await OTP.findOneAndUpdate(
        { otp_id: otpRecord.otp_id },
        {
          is_used: true,
          updated_at: new Date()
        }
      );

      return {
        success: true,
        message: 'OTP verified successfully',
        otp_id: otpRecord.otp_id
      };
    } catch (error) {
      logger.error('Failed to verify OTP', {
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        error: error.message,
        message: 'Failed to verify OTP'
      };
    }
  }

  /**
   * Send OTP via SMS only
   * @param {string} phone - Phone number
   * @param {number} otpType - OTP type ID
   * @param {number} userId - User ID (optional)
   * @param {number} expiresInMinutes - Expiration time in minutes (default: 10)
   * @returns {Promise<Object>} Result object
   */
  async sendOTPViaSMS(phone, otpType, userId = null, expiresInMinutes = 10) {
    return this.sendOTP({
      phone,
      otpType,
      userId,
      expiresInMinutes
    });
  }

  /**
   * Send OTP via Email only
   * @param {string} email - Email address
   * @param {number} otpType - OTP type ID
   * @param {number} userId - User ID (optional)
   * @param {number} expiresInMinutes - Expiration time in minutes (default: 10)
   * @returns {Promise<Object>} Result object
   */
  async sendOTPViaEmail(email, otpType, userId = null, expiresInMinutes = 10) {
    return this.sendOTP({
      email,
      otpType,
      userId,
      expiresInMinutes
    });
  }

  /**
   * Resend OTP
   * @param {Object} options - Same as sendOTP options
   * @returns {Promise<Object>} Result object
   */
  async resendOTP(options = {}) {
    // Deactivate existing OTPs first
    const { email, phone, otpType } = options;
    
    if (email) {
      await OTP.updateMany(
        {
          email: email.toLowerCase(),
          otp_type: otpType,
          status: true
        },
        {
          status: false,
          updated_at: new Date()
        }
      );
    }

    // Send new OTP
    return this.sendOTP(options);
  }
}

// Create singleton instance
const otpService = new OTPService();

module.exports = otpService;

