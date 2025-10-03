const axios = require('axios');
const crypto = require('crypto');
const { prisma } = require('../config/database');
const logger = require('../config/logger');

class PaymentService {
  constructor() {
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    this.paystackBaseURL = 'https://api.paystack.co';
  }

  // Initialize payment
  async initializePayment(bookingId, amount, customerEmail, customerPhone) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          customer: true,
          service: true
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      const paymentData = {
        amount: amount * 100, // Convert to kobo (Paystack uses kobo)
        email: customerEmail || `${customerPhone}@marconis.com`,
        currency: 'GHS',
        reference: `MC_${Date.now()}_${bookingId}`,
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
        metadata: {
          booking_id: bookingId,
          customer_phone: customerPhone,
          service_name: booking.service.name,
          custom_fields: [
            {
              display_name: "Booking ID",
              variable_name: "booking_id",
              value: bookingId
            },
            {
              display_name: "Service",
              variable_name: "service",
              value: booking.service.name
            }
          ]
        },
        channels: ['mobile_money', 'card'] // Available payment channels
      };

      const response = await axios.post(
        `${this.paystackBaseURL}/transaction/initialize`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        // Create payment record
        await prisma.payment.create({
          data: {
            bookingId,
            customerId: booking.customerId,
            amount: amount * 100, // Store in kobo
            currency: 'GHS',
            method: 'MOBILE_MONEY',
            status: 'PENDING',
            reference: paymentData.reference
          }
        });

        return {
          success: true,
          data: response.data.data,
          reference: paymentData.reference
        };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      logger.error('Payment initialization failed:', error);
      throw error;
    }
  }

  // Verify payment
  async verifyPayment(reference) {
    try {
      const response = await axios.get(
        `${this.paystackBaseURL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`
          }
        }
      );

      if (response.data.status && response.data.data.status === 'success') {
        const paymentData = response.data.data;
        
        // Update payment in database
        const payment = await prisma.payment.update({
          where: { reference },
          data: {
            status: 'PAID',
            paidAt: new Date()
          },
          include: {
            booking: {
              include: {
                customer: true,
                service: true
              }
            }
          }
        });

        // Update booking status
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' }
        });

        // Send confirmation SMS
        const smsMessage = `Payment confirmed! Your booking for ${payment.booking.service.name} is confirmed. Amount: ₵${paymentData.amount / 100}`;
        // await sendSMS(payment.booking.customer.phone, smsMessage);

        logger.info(`Payment verified successfully: ${reference}`);
        
        return {
          success: true,
          payment,
          paymentData
        };
      } else {
        return {
          success: false,
          message: 'Payment verification failed'
        };
      }
    } catch (error) {
      logger.error('Payment verification failed:', error);
      throw error;
    }
  }

  // Handle webhook from Paystack
  async handleWebhook(payload, signature) {
    try {
      // Verify webhook signature
      const computedHash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (computedHash !== signature) {
        throw new Error('Invalid webhook signature');
      }

      const event = payload.event;
      const data = payload.data;

      switch (event) {
        case 'charge.success':
          await this.handleSuccessfulPayment(data);
          break;
        case 'charge.failed':
          await this.handleFailedPayment(data);
          break;
        default:
          logger.info(`Unhandled webhook event: ${event}`);
      }

      return { success: true };
    } catch (error) {
      logger.error('Webhook handling failed:', error);
      throw error;
    }
  }

  // Handle successful payment webhook
  async handleSuccessfulPayment(paymentData) {
    try {
      const reference = paymentData.reference;
      
      const payment = await prisma.payment.findUnique({
        where: { reference },
        include: {
          booking: {
            include: {
              customer: true,
              service: true
            }
          }
        }
      });

      if (payment && payment.status === 'PENDING') {
        // Update payment status
        await prisma.payment.update({
          where: { reference },
          data: {
            status: 'PAID',
            paidAt: new Date()
          }
        });

        // Update booking status
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' }
        });

        logger.info(`Payment confirmed via webhook: ${reference}`);
      }
    } catch (error) {
      logger.error('Error handling successful payment:', error);
      throw error;
    }
  }

  // Handle failed payment webhook
  async handleFailedPayment(paymentData) {
    try {
      const reference = paymentData.reference;
      
      await prisma.payment.update({
        where: { reference },
        data: {
          status: 'FAILED'
        }
      });

      logger.info(`Payment failed via webhook: ${reference}`);
    } catch (error) {
      logger.error('Error handling failed payment:', error);
      throw error;
    }
  }

  // Refund payment
  async refundPayment(paymentId, reason = 'Booking cancelled') {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: {
            include: {
              customer: true,
              service: true
            }
          }
        }
      });

      if (!payment || payment.status !== 'PAID') {
        throw new Error('Payment not found or not eligible for refund');
      }

      const refundData = {
        transaction: payment.reference,
        amount: payment.amount, // Full refund
        currency: payment.currency,
        customer_note: reason,
        merchant_note: `Refund for booking ${payment.bookingId}`
      };

      const response = await axios.post(
        `${this.paystackBaseURL}/refund`,
        refundData,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status) {
        // Update payment status
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'REFUNDED',
            refundedAt: new Date()
          }
        });

        logger.info(`Refund processed: ${payment.reference}`);
        
        return {
          success: true,
          refund: response.data.data
        };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      logger.error('Refund processing failed:', error);
      throw error;
    }
  }

  // Get payment analytics
  async getPaymentAnalytics(startDate, endDate) {
    try {
      const payments = await prisma.payment.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          booking: {
            include: {
              service: true
            }
          }
        }
      });

      const analytics = {
        totalRevenue: 0,
        totalTransactions: payments.length,
        successfulPayments: 0,
        failedPayments: 0,
        refundedPayments: 0,
        paymentsByMethod: {},
        revenueByService: {}
      };

      payments.forEach(payment => {
        // Count payment statuses
        switch (payment.status) {
          case 'PAID':
            analytics.successfulPayments++;
            analytics.totalRevenue += payment.amount;
            break;
          case 'FAILED':
            analytics.failedPayments++;
            break;
          case 'REFUNDED':
            analytics.refundedPayments++;
            break;
        }

        // Count by payment method
        if (!analytics.paymentsByMethod[payment.method]) {
          analytics.paymentsByMethod[payment.method] = 0;
        }
        analytics.paymentsByMethod[payment.method]++;

        // Revenue by service
        if (payment.status === 'PAID') {
          const serviceName = payment.booking.service.name;
          if (!analytics.revenueByService[serviceName]) {
            analytics.revenueByService[serviceName] = 0;
          }
          analytics.revenueByService[serviceName] += payment.amount;
        }
      });

      // Convert revenue from kobo to cedis
      analytics.totalRevenue = analytics.totalRevenue / 100;
      Object.keys(analytics.revenueByService).forEach(service => {
        analytics.revenueByService[service] = analytics.revenueByService[service] / 100;
      });

      return analytics;
    } catch (error) {
      logger.error('Error getting payment analytics:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
