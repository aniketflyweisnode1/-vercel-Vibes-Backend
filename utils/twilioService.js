const twilio = require('twilio');
const logger = require('./logger');
const { generateOTP } = require('./helpers');

/**
 * Twilio SMS/OTP Service utility
 */
class TwilioService {
  constructor() {
    this.client = null;
    this.accountSid = "";
    this.authToken = "";
    this.phoneNumber = "";
    this.initialized = false;
    this.initializeClient();
  }

  /**
   * Initialize Twilio client
   */
  initializeClient() {
    try {
      if (!this.accountSid || !this.authToken) {
        logger.warn('Twilio credentials not configured. SMS service will be disabled.');
        this.client = null;
        this.initialized = false;
        return;
      }

      this.client = twilio(this.accountSid, this.authToken);
      this.initialized = true;
      logger.info('Twilio client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Twilio client', { error: error.message });
      this.client = null;
      this.initialized = false;
    }
  }

  /**
   * Format phone number to E.164 format (required by Twilio)
   * @param {string} phone - Phone number to format
   * @param {string} countryCode - Country code (default: '+1' for US)
   * @returns {string} Formatted phone number in E.164 format
   */
  formatPhoneNumber(phone, countryCode = '+1') {
    if (!phone) return null;
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If phone starts with country code, use it
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      return `+${cleaned}`;
    }
    
    // If phone is 10 digits, add country code
    if (cleaned.length === 10) {
      return `${countryCode}${cleaned}`;
    }
    
    // If already in E.164 format, return as is
    if (phone.startsWith('+')) {
      return phone;
    }
    
    return null;
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if phone is valid
   */
  isValidPhoneNumber(phone) {
    if (!phone) return false;
    const formatted = this.formatPhoneNumber(phone);
    return formatted !== null;
  }

  /**
   * Send OTP via SMS using Twilio
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} otp - OTP code to send (optional, will generate if not provided)
   * @param {string} message - Custom message template (optional)
   * @returns {Promise<Object>} Result object with success status and details
   */
  async sendOTP(phoneNumber, otp = null, message = null) {
    try {
      if (!this.initialized || !this.client) {
        logger.error('Twilio client not initialized');
        return {
          success: false,
          error: 'Twilio service not configured',
          message: 'SMS service is not available'
        };
      }

      if (!this.phoneNumber) {
        logger.error('Twilio phone number not configured');
        return {
          success: false,
          error: 'Twilio phone number not configured',
          message: 'SMS service is not available'
        };
      }

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        logger.error('Invalid phone number format', { phoneNumber });
        return {
          success: false,
          error: 'Invalid phone number format',
          message: 'Please provide a valid phone number'
        };
      }

      // Generate OTP if not provided
      const otpCode = otp || generateOTP();

      // Create message
      const smsMessage = message || `Your verification code is: ${otpCode}. This code will expire in 10 minutes. Do not share this code with anyone.`;

      // Send SMS
      const messageResult = await this.client.messages.create({
        body: smsMessage,
        from: this.phoneNumber,
        to: formattedPhone
      });

      logger.info('OTP SMS sent successfully', {
        phoneNumber: formattedPhone,
        messageSid: messageResult.sid,
        status: messageResult.status
      });

      return {
        success: true,
        messageSid: messageResult.sid,
        status: messageResult.status,
        otp: otpCode, // Return OTP for storage in database
        phoneNumber: formattedPhone,
        message: 'OTP sent successfully via SMS'
      };
    } catch (error) {
      logger.error('Failed to send OTP via SMS', {
        phoneNumber,
        error: error.message,
        code: error.code,
        status: error.status
      });

      return {
        success: false,
        error: error.message,
        code: error.code,
        status: error.status,
        message: 'Failed to send OTP via SMS'
      };
    }
  }

  /**
   * Send custom SMS message
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - Message to send
   * @returns {Promise<Object>} Result object with success status and details
   */
  async sendSMS(phoneNumber, message) {
    try {
      if (!this.initialized || !this.client) {
        logger.error('Twilio client not initialized');
        return {
          success: false,
          error: 'Twilio service not configured',
          message: 'SMS service is not available'
        };
      }

      if (!this.phoneNumber) {
        logger.error('Twilio phone number not configured');
        return {
          success: false,
          error: 'Twilio phone number not configured',
          message: 'SMS service is not available'
        };
      }

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        logger.error('Invalid phone number format', { phoneNumber });
        return {
          success: false,
          error: 'Invalid phone number format',
          message: 'Please provide a valid phone number'
        };
      }

      // Send SMS
      const messageResult = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: formattedPhone
      });

      logger.info('SMS sent successfully', {
        phoneNumber: formattedPhone,
        messageSid: messageResult.sid,
        status: messageResult.status
      });

      return {
        success: true,
        messageSid: messageResult.sid,
        status: messageResult.status,
        phoneNumber: formattedPhone,
        message: 'SMS sent successfully'
      };
    } catch (error) {
      logger.error('Failed to send SMS', {
        phoneNumber,
        error: error.message,
        code: error.code,
        status: error.status
      });

      return {
        success: false,
        error: error.message,
        code: error.code,
        status: error.status,
        message: 'Failed to send SMS'
      };
    }
  }

  /**
   * Verify phone number using Twilio Lookup API
   * @param {string} phoneNumber - Phone number to verify
   * @returns {Promise<Object>} Result object with phone number details
   */
  async verifyPhoneNumber(phoneNumber) {
    try {
      if (!this.initialized || !this.client) {
        logger.error('Twilio client not initialized');
        return {
          success: false,
          error: 'Twilio service not configured',
          message: 'Phone verification service is not available'
        };
      }

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      if (!formattedPhone) {
        return {
          success: false,
          error: 'Invalid phone number format',
          message: 'Please provide a valid phone number'
        };
      }

      // Use Twilio Lookup API to verify phone number
      const phoneNumberData = await this.client.lookups.v1.phoneNumbers(formattedPhone).fetch();

      logger.info('Phone number verified', {
        phoneNumber: formattedPhone,
        countryCode: phoneNumberData.countryCode,
        phoneType: phoneNumberData.phoneType
      });

      return {
        success: true,
        phoneNumber: phoneNumberData.phoneNumber,
        countryCode: phoneNumberData.countryCode,
        phoneType: phoneNumberData.phoneType,
        nationalFormat: phoneNumberData.nationalFormat,
        message: 'Phone number verified successfully'
      };
    } catch (error) {
      logger.error('Failed to verify phone number', {
        phoneNumber,
        error: error.message,
        code: error.code
      });

      return {
        success: false,
        error: error.message,
        code: error.code,
        message: 'Failed to verify phone number'
      };
    }
  }

  /**
   * Send OTP and return the OTP code for database storage
   * This is a convenience method that generates OTP, sends it, and returns it
   * @param {string} phoneNumber - Recipient phone number
   * @param {Object} options - Additional options
   * @param {string} options.messageTemplate - Custom message template (use {otp} placeholder)
   * @param {string} options.countryCode - Country code (default: '+1')
   * @returns {Promise<Object>} Result object with OTP code and send status
   */
  async sendOTPWithCode(phoneNumber, options = {}) {
    try {
      const { messageTemplate, countryCode = '+1' } = options;
      
      // Generate OTP
      const otpCode = generateOTP();
      
      // Create message
      let message;
      if (messageTemplate) {
        message = messageTemplate.replace('{otp}', otpCode);
      } else {
        message = `Your verification code is: ${otpCode}. This code will expire in 10 minutes. Do not share this code with anyone.`;
      }

      // Send OTP
      const result = await this.sendOTP(phoneNumber, otpCode, message);
      
      if (result.success) {
        return {
          success: true,
          otp: otpCode,
          messageSid: result.messageSid,
          phoneNumber: result.phoneNumber,
          message: 'OTP sent successfully'
        };
      } else {
        return {
          success: false,
          error: result.error,
          message: result.message
        };
      }
    } catch (error) {
      logger.error('Failed to send OTP with code', {
        phoneNumber,
        error: error.message
      });

      return {
        success: false,
        error: error.message,
        message: 'Failed to send OTP'
      };
    }
  }
}

// Create singleton instance
const twilioService = new TwilioService();

module.exports = twilioService;

