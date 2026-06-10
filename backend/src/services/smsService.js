const twilio = require('twilio');
const logger = require('../config/logger');

class SMSService {
  constructor() {
    this.twilioClient = null;
    this.isConfigured = false;
    
    // Initialize Twilio if credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        this.isConfigured = true;
        logger.info('SMS service initialized with Twilio');
      } catch (err) {
        logger.warn('SMS service initialization failed:', err.message);
      }
    } else {
      logger.warn('SMS service not configured - Twilio credentials missing');
    }
  }

  // Send SMS using Twilio with timeout
  async sendSMS(to, message) {
    try {
      if (!this.isConfigured) {
        logger.warn('SMS not sent - service not configured', { to, message });
        return { success: false, message: 'SMS service not configured' };
      }

      const formattedPhone = this.formatPhoneNumber(to);

      const result = await Promise.race([
        this.twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('SMS timeout after 5s')), 5000)
        )
      ]);

      logger.info('SMS sent successfully', {
        to: formattedPhone,
        messageId: result.sid,
        status: result.status
      });

      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };

    } catch (error) {
      logger.error('Failed to send SMS', {
        to,
        error: error.message,
        code: error.code
      });

      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Format phone number to international format
  formatPhoneNumber(phone) {
    // Remove any non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // If it starts with 0 (Ghana format), replace with +233
    if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      return '+233' + cleanPhone.substring(1);
    }
    
    // If it already has country code
    if (cleanPhone.startsWith('233') && cleanPhone.length === 12) {
      return '+' + cleanPhone;
    }
    
    // If it's already in international format
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // Default: assume it's a Ghana number and add +233
    return '+233' + cleanPhone;
  }

  // Send booking confirmation SMS
  async sendBookingConfirmation(customerPhone, bookingDetails) {
    const message = `🎯 Booking Confirmed! 
Service: ${bookingDetails.service}
Date: ${bookingDetails.date}
Time: ${bookingDetails.time}
Barber: ${bookingDetails.barber || 'Any available barber'}
ID: ${bookingDetails.id}

Marconi's Barber Shop - ${process.env.BUSINESS_PHONE}`;

    return await this.sendSMS(customerPhone, message);
  }

  // Send booking reminder SMS
  async sendBookingReminder(customerPhone, bookingDetails) {
    const message = `⏰ Reminder: Your appointment is tomorrow!
Service: ${bookingDetails.service}
Date: ${bookingDetails.date}
Time: ${bookingDetails.time}

See you soon! - Marconi's Barber Shop`;

    return await this.sendSMS(customerPhone, message);
  }

  // Send booking cancellation SMS
  async sendBookingCancellation(customerPhone, bookingDetails, reason = 'booking cancelled') {
    const message = `❌ Booking Cancelled
Your appointment for ${bookingDetails.service} on ${bookingDetails.date} has been cancelled.
Reason: ${reason}

For rebooking, call ${process.env.BUSINESS_PHONE} - Marconi's Barber Shop`;

    return await this.sendSMS(customerPhone, message);
  }

  // Send payment confirmation SMS
  async sendPaymentConfirmation(customerPhone, paymentDetails) {
    const message = `💳 Payment Confirmed! 
Amount: ₵${paymentDetails.amount}
Service: ${paymentDetails.service}
Reference: ${paymentDetails.reference}

Thank you! - Marconi's Barber Shop`;

    return await this.sendSMS(customerPhone, message);
  }

  // Send promotional SMS
  async sendPromotionalSMS(phoneNumbers, message) {
    try {
      const results = [];
      
      for (const phone of phoneNumbers) {
        const result = await this.sendSMS(phone, message);
        results.push({ phone, ...result });
        
        // Add delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      logger.info(`Promotional SMS campaign completed`, {
        total: phoneNumbers.length,
        successful,
        failed
      });
      
      return {
        success: true,
        total: phoneNumbers.length,
        successful,
        failed,
        results
      };
      
    } catch (error) {
      logger.error('Promotional SMS campaign failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check SMS service status
  getStatus() {
    return {
      configured: this.isConfigured,
      provider: this.isConfigured ? 'Twilio' : null,
      accountSid: this.isConfigured ? process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...' : null
    };
  }
}

// Export singleton instance
const smsService = new SMSService();

module.exports = {
  sendSMS: (to, message) => smsService.sendSMS(to, message),
  sendBookingConfirmation: (phone, details) => smsService.sendBookingConfirmation(phone, details),
  sendBookingReminder: (phone, details) => smsService.sendBookingReminder(phone, details),
  sendBookingCancellation: (phone, details, reason) => smsService.sendBookingCancellation(phone, details, reason),
  sendPaymentConfirmation: (phone, details) => smsService.sendPaymentConfirmation(phone, details),
  sendPromotionalSMS: (phones, message) => smsService.sendPromotionalSMS(phones, message),
  getStatus: () => smsService.getStatus()
};
