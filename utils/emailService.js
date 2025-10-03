const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Email service utility for sending emails
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.transporterCreated = false;
    this.initializeTransporter();
  }

  /**
   * Initialize nodemailer transporter
   */
  initializeTransporter() {
    try {
      // For development, you can use Gmail or other SMTP services
      // Make sure to set these environment variables in your .env file
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "movpankaj3@gmail.com", // Your email address
          pass: "shjopoqudhknisxh" // Your email password or app password
        }
      });

      // Verify transporter configuration asynchronously
      this.transporter.verify((error, success) => {
        if (error) {
          logger.error('Email transporter verification failed', { error: error.message });
          this.initialized = false;
        } else {
          logger.info('Email transporter is ready to send messages');
          this.initialized = true;
        }
      });
      
      // Set a temporary flag to indicate transporter was created
      this.transporterCreated = true;
    } catch (error) {
      logger.error('Failed to initialize email transporter', { error: error.message });
      this.transporter = null;
      this.initialized = false;
    }
  }

  /**
   * Wait for transporter initialization
   */
  async waitForInitialization() {
    const maxWaitTime = 10000; // 10 seconds
    const checkInterval = 100; // 100ms
    let waited = 0;

    while (!this.initialized && waited < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }

    if (!this.initialized) {
      throw new Error('Email transporter initialization timeout');
    }
  }

  /**
   * Send OTP email
   * @param {string} to - Recipient email address
   * @param {string} otp - OTP code
   * @param {string} userName - User's name (optional)
   * @returns {Promise<boolean>} Success status
   */
  async sendOTPEmail(to, otp, userName = 'User') {
    try {
      // Create transporter if it doesn't exist
      if (!this.transporter) {
        logger.info('Creating new transporter...');
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: "movpankaj3@gmail.com",
            pass: "shjopoqudhknisxh"
          }
        });
      }

      const mailOptions = {
        from: "movpankaj3@gmail.com",
        to: to,
        subject: 'Your Login OTP - Mr. Vibes',
        html: this.generateOTPEmailTemplate(otp, userName),
        text: `Your login OTP is: ${otp}. This OTP is valid for 10 minutes.`
      };

      logger.info('Attempting to send email...', { to, from: mailOptions.from });
      const result = await this.transporter.sendMail(mailOptions);
      logger.info('OTP email sent successfully', {
        to,
        messageId: result.messageId
      });

      return true;
    } catch (error) {
      logger.error('Failed to send OTP email', {
        to,
        error: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  /**
   * Generate HTML email template for OTP
   * @param {string} otp - OTP code
   * @param {string} userName - User's name
   * @returns {string} HTML email template
   */
  generateOTPEmailTemplate(otp, userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login OTP - Mr. Vibes</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .otp-code {
            background-color: #fff;
            border: 2px dashed #4CAF50;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            color: #4CAF50;
            margin: 20px 0;
            border-radius: 8px;
            letter-spacing: 5px;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Mr. Vibes</h1>
          <p>Your Login Verification Code</p>
        </div>
        
        <div class="content">
          <h2>Hello ${userName}!</h2>
          
          <p>You requested a login verification code. Use the following OTP to complete your login:</p>
          
          <div class="otp-code">${otp}</div>
          
          <div class="warning">
            <strong>Important:</strong>
            <ul>
              <li>This OTP is valid for 10 minutes only</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this code, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you have any questions or concerns, please contact our support team.</p>
          
          <p>Best regards,<br>The Mr. Vibes Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2024 Mr. Vibes. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send welcome email
   * @param {string} to - Recipient email address
   * @param {string} userName - User's name
   * @returns {Promise<boolean>} Success status
   */
  async sendWelcomeEmail(to, userName) {
    try {
      // Wait for initialization if not ready
      if (!this.initialized) {
        await this.waitForInitialization();
      }
      
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

       const mailOptions = {
         from: "movpankaj3@gmail.com",
         to: to,
         subject: 'Welcome to Mr. Vibes!',
         html: this.generateWelcomeEmailTemplate(userName),
         text: `Welcome to Mr. Vibes, ${userName}! We're excited to have you on board.`
       };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Welcome email sent successfully', {
        to,
        messageId: result.messageId
      });

      return true;
    } catch (error) {
      logger.error('Failed to send welcome email', {
        to,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Generate HTML email template for welcome email
   * @param {string} userName - User's name
   * @returns {string} HTML email template
   */
  generateWelcomeEmailTemplate(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Mr. Vibes</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Mr. Vibes!</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${userName}!</h2>
          
          <p>Welcome to Mr. Vibes! We're thrilled to have you join our community.</p>
          
          <p>Your account has been successfully created and you can now:</p>
          <ul>
            <li>Access all our features and services</li>
            <li>Connect with other users</li>
            <li>Enjoy a seamless experience</li>
          </ul>
          
          <p>If you have any questions or need assistance, feel free to contact our support team.</p>
          
          <p>Best regards,<br>The Mr. Vibes Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2024 Mr. Vibes. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
