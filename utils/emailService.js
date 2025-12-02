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
      const emailUser = "";
      const emailPass = "";

      // Only create transporter if credentials are provided
      if (!emailUser || !emailPass) {
        logger.warn('Email credentials not configured. Email service will be disabled.');
        this.transporter = null;
        this.initialized = false;
        this.transporterCreated = false;
        return;
      }

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
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
   * Send forgot password OTP email
   * @param {string} to - Recipient email address
   * @param {string} otp - OTP code
   * @param {string} userName - User's name (optional)
   * @returns {Promise<boolean>} Success status
   */
  async sendForgotPasswordOTPEmail(to, otp, userName = 'User') {
    try {
      const emailUser = "";
      const emailPass = "";

      // Check if email is configured
      if (!emailUser || !emailPass) {
        logger.warn('Email credentials not configured. Cannot send forgot password OTP email.');
        return false;
      }

      // Create transporter if it doesn't exist
      if (!this.transporter) {
        logger.info('Creating new transporter...');
        this.transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass
          }
        });
      }

      const mailOptions = {
        from: emailUser,
        to: to,
        subject: 'Password Reset OTP - Mr. Vibes',
        html: this.generateForgotPasswordOTPEmailTemplate(otp, userName),
        text: `Your password reset OTP is: ${otp}. This OTP is valid for 10 minutes.`
      };

      logger.info('Attempting to send forgot password email...', { to, from: mailOptions.from });
      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Forgot password OTP email sent successfully', {
        to,
        messageId: result.messageId
      });

      return true;
    } catch (error) {
      logger.error('Failed to send forgot password OTP email', {
        to,
        error: error.message,
        stack: error.stack
      });
      return false;
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
      const emailUser = "";
      const emailPass = "";

      // Check if email is configured
      if (!emailUser || !emailPass) {
        logger.warn('Email credentials not configured. Cannot send OTP email.');
        return false;
      }

      // Create transporter if it doesn't exist
      if (!this.transporter) {
        logger.info('Creating new transporter...');
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass
          }
        });
      }

      const mailOptions = {
        from: emailUser,
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
   * Generate HTML email template for forgot password OTP
   * @param {string} otp - OTP code
   * @param {string} userName - User's name
   * @returns {string} HTML email template
   */
  generateForgotPasswordOTPEmailTemplate(otp, userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP - Mr. Vibes</title>
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
            background-color: #FF6B35;
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
            border: 2px dashed #FF6B35;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            color: #FF6B35;
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
          <p>Password Reset Verification Code</p>
        </div>
        
        <div class="content">
          <h2>Hello ${userName}!</h2>
          
          <p>You requested a password reset for your account. Use the following OTP to reset your password:</p>
          
          <div class="otp-code">${otp}</div>
          
          <div class="warning">
            <strong>Important:</strong>
            <ul>
              <li>This OTP is valid for 10 minutes only</li>
              <li>Do not share this code with anyone</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Your account security is important to us</li>
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
      const emailUser = "";
      const emailPass = "";

      // Check if email is configured
      if (!emailUser || !emailPass) {
        logger.warn('Email credentials not configured. Cannot send welcome email.');
        return false;
      }

      // Wait for initialization if not ready
      if (!this.initialized) {
        await this.waitForInitialization();
      }
      
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

       const mailOptions = {
         from: emailUser,
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

  /**
   * Generate ICS (iCalendar) file content for calendar event
   * @param {Object} eventData - Event data object
   * @param {string} eventData.title - Event title
   * @param {Date} eventData.startDate - Event start date
   * @param {string} eventData.startTime - Event start time (HH:mm format)
   * @param {string} eventData.description - Event description
   * @param {string} eventData.location - Event location
   * @param {string} eventData.organizerEmail - Organizer email
   * @param {string} eventData.organizerName - Organizer name
   * @returns {string} ICS file content
   */
  generateICSFile(eventData) {
    const { title, startDate, startTime, description, location, organizerEmail, organizerName } = eventData;
    
    // Parse time and combine with date
    const [hours, minutes] = startTime.split(':');
    const eventDateTime = new Date(startDate);
    eventDateTime.setHours(parseInt(hours), parseInt(minutes || 0), 0, 0);
    
    // Event duration (default 2 hours)
    const endDateTime = new Date(eventDateTime);
    endDateTime.setHours(endDateTime.getHours() + 2);
    
    // Format date for ICS (YYYYMMDDTHHmmssZ)
    const formatICSDate = (date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hour = String(date.getUTCHours()).padStart(2, '0');
      const minute = String(date.getUTCMinutes()).padStart(2, '0');
      const second = String(date.getUTCSeconds()).padStart(2, '0');
      return `${year}${month}${day}T${hour}${minute}${second}Z`;
    };
    
    const dtstart = formatICSDate(eventDateTime);
    const dtend = formatICSDate(endDateTime);
    const dtstamp = formatICSDate(new Date());
    
    // Escape special characters in text fields
    const escapeICS = (text) => {
      if (!text) return '';
      return String(text)
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
    };
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mr. Vibes//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@mr vibes.com
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${escapeICS(title)}
DESCRIPTION:${escapeICS(description)}
LOCATION:${escapeICS(location)}
ORGANIZER;CN=${escapeICS(organizerName)}:MAILTO:${organizerEmail || 'noreply@mrvibes.com'}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;
    
    return icsContent;
  }

  /**
   * Send event creation email with calendar attachment
   * @param {string} to - Recipient email address
   * @param {Object} eventData - Event data object
   * @param {string} eventData.title - Event title
   * @param {Date} eventData.date - Event date
   * @param {string} eventData.time - Event time
   * @param {string} eventData.location - Event location
   * @param {string} eventData.description - Event description
   * @param {string} userName - User's name
   * @param {string} userEmail - User's email
   * @returns {Promise<boolean>} Success status
   */
  async sendEventCreatedEmail(to, eventData, userName, userEmail) {
    try {
      const emailUser = "";
      const emailPass = "";

      // Check if email is configured
      if (!emailUser || !emailPass) {
        logger.warn('Email credentials not configured. Cannot send event created email.');
        return false;
      }

      // Create transporter if it doesn't exist
      if (!this.transporter) {
        logger.info('Creating new transporter...');
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass
          }
        });
      }

      // Generate ICS file
      const icsContent = this.generateICSFile({
        title: eventData.title,
        startDate: eventData.date,
        startTime: eventData.time,
        description: eventData.description || '',
        location: eventData.location || '',
        organizerEmail: userEmail || emailUser || 'noreply@mrvibes.com',
        organizerName: userName || 'Mr. Vibes'
      });

      const mailOptions = {
        from: emailUser,
        to: to,
        subject: `Event Created: ${eventData.title} - Mr. Vibes`,
        html: this.generateEventCreatedEmailTemplate(eventData, userName),
        text: `Your event "${eventData.title}" has been created successfully. Please check the attached calendar file to add it to your calendar.`,
        attachments: [
          {
            filename: 'event.ics',
            content: Buffer.from(icsContent),
            contentType: 'text/calendar; charset=UTF-8; method=REQUEST',
            contentDisposition: 'attachment'
          }
        ]
      };

      logger.info('Attempting to send event created email...', { to, from: mailOptions.from });
      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Event created email sent successfully', {
        to,
        messageId: result.messageId
      });

      return true;
    } catch (error) {
      logger.error('Failed to send event created email', {
        to,
        error: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  /**
   * Generate HTML email template for event creation
   * @param {Object} eventData - Event data
   * @param {string} userName - User's name
   * @returns {string} HTML email template
   */
  generateEventCreatedEmailTemplate(eventData, userName) {
    // Format date
    const formatDate = (date) => {
      if (!date) return 'Not specified';
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    // Format time
    const formatTime = (time) => {
      if (!time) return 'Not specified';
      // Assume time is in HH:mm format, convert to 12-hour format
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes || '00'} ${ampm}`;
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Created - Mr. Vibes</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
          }
          .event-details {
            background-color: #f9f9f9;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .event-details h2 {
            margin-top: 0;
            color: #667eea;
            font-size: 24px;
          }
          .detail-row {
            margin: 15px 0;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: bold;
            color: #666;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          .detail-value {
            color: #333;
            font-size: 16px;
          }
          .calendar-note {
            background-color: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .calendar-note p {
            margin: 5px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background-color: #f9f9f9;
            color: #666;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Event Created Successfully!</h1>
            <p>Your event has been created and added to your calendar</p>
          </div>
          
          <div class="content">
            <h2>Hello ${userName || 'User'}!</h2>
            
            <p>Great news! Your event has been successfully created. We've attached a calendar file to this email so you can easily add it to your calendar.</p>
            
            <div class="event-details">
              <h2>${eventData.title || 'Event'}</h2>
              
              <div class="detail-row">
                <div class="detail-label">Date</div>
                <div class="detail-value">${formatDate(eventData.date)}</div>
              </div>
              
              <div class="detail-row">
                <div class="detail-label">Time</div>
                <div class="detail-value">${formatTime(eventData.time)}</div>
              </div>
              
              ${eventData.location ? `
              <div class="detail-row">
                <div class="detail-label">Location</div>
                <div class="detail-value">${eventData.location}</div>
              </div>
              ` : ''}
              
              ${eventData.description ? `
              <div class="detail-row">
                <div class="detail-label">Description</div>
                <div class="detail-value">${eventData.description}</div>
              </div>
              ` : ''}
            </div>
            
            <div class="calendar-note">
              <p><strong>📅 Add to Calendar:</strong></p>
              <p>We've attached a calendar file (event.ics) to this email. Simply open the attachment to add this event to your calendar application.</p>
            </div>
            
            <p>If you need to make any changes to your event, you can do so through your account dashboard.</p>
            
            <p>Best regards,<br><strong>The Mr. Vibes Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; 2024 Mr. Vibes. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
