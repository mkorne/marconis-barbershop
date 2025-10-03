const { prisma } = require('../config/database');
const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');
const { sendSMS } = require('../services/smsService');
const { addHours, parseISO, format, isBefore, isAfter, addDays } = require('date-fns');

class BookingController {
  // Get available time slots for a specific date and barber
  async getAvailableSlots(req, res) {
    try {
      const { date, barberId, serviceId } = req.query;

      if (!date) {
        return res.status(400).json({ error: 'Date is required' });
      }

      // Get service duration
      const service = await prisma.service.findUnique({
        where: { id: serviceId }
      });

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      // Get business settings
      const settings = await prisma.businessSettings.findFirst();
      
      // Get existing bookings for the date
      const existingBookings = await prisma.booking.findMany({
        where: {
          date: parseISO(date),
          barberId: barberId || undefined,
          status: {
            not: 'CANCELLED'
          }
        },
        select: {
          startTime: true,
          endTime: true
        }
      });

      // Generate available slots
      const slots = this.generateTimeSlots(
        settings.startTime,
        settings.endTime,
        service.duration,
        existingBookings
      );

      res.json({ slots });
    } catch (error) {
      logger.error('Error getting available slots:', error);
      res.status(500).json({ error: 'Failed to get available slots' });
    }
  }

  // Create a new booking
  async createBooking(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        customerName,
        customerPhone,
        customerEmail,
        serviceId,
        barberId,
        date,
        startTime
      } = req.body;

      // Check if customer exists, create if not
      let customer = await prisma.user.findUnique({
        where: { phone: customerPhone }
      });

      if (!customer) {
        customer = await prisma.user.create({
          data: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail || null
          }
        });
      }

      // Get service details
      const service = await prisma.service.findUnique({
        where: { id: serviceId }
      });

      // Calculate end time
      const endTime = this.calculateEndTime(startTime, service.duration);

      // Check availability again
      const isAvailable = await this.checkAvailability(date, startTime, endTime, barberId);
      if (!isAvailable) {
        return res.status(409).json({ error: 'Time slot is no longer available' });
      }

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          customerId: customer.id,
          serviceId,
          barberId: barberId || null,
          date: parseISO(date),
          startTime,
          endTime,
          status: 'PENDING'
        },
        include: {
          customer: true,
          service: true,
          barber: true
        }
      });

      // Send confirmation SMS
      const smsMessage = `Booking confirmed! ${service.name} on ${format(parseISO(date), 'MMM dd, yyyy')} at ${startTime}. Booking ID: ${booking.id}`;
      await sendSMS(customerPhone, smsMessage);

      logger.info(`New booking created: ${booking.id}`);

      res.status(201).json({
        message: 'Booking created successfully',
        booking: {
          id: booking.id,
          service: booking.service.name,
          date: format(booking.date, 'yyyy-MM-dd'),
          startTime: booking.startTime,
          barber: booking.barber?.name || 'Any available barber',
          status: booking.status
        }
      });

    } catch (error) {
      logger.error('Error creating booking:', error);
      res.status(500).json({ error: 'Failed to create booking' });
    }
  }

  // Get booking details
  async getBooking(req, res) {
    try {
      const { id } = req.params;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true
            }
          },
          service: true,
          barber: true,
          payment: true
        }
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      res.json({ booking });
    } catch (error) {
      logger.error('Error getting booking:', error);
      res.status(500).json({ error: 'Failed to get booking' });
    }
  }

  // Update booking status
  async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const booking = await prisma.booking.update({
        where: { id },
        data: {
          status,
          notes: notes || undefined
        },
        include: {
          customer: true,
          service: true
        }
      });

      // Send SMS notification for status changes
      if (status === 'CONFIRMED') {
        const message = `Your booking for ${booking.service.name} has been confirmed for ${format(booking.date, 'MMM dd, yyyy')} at ${booking.startTime}`;
        await sendSMS(booking.customer.phone, message);
      }

      res.json({
        message: 'Booking status updated',
        booking
      });
    } catch (error) {
      logger.error('Error updating booking status:', error);
      res.status(500).json({ error: 'Failed to update booking status' });
    }
  }

  // Cancel booking
  async cancelBooking(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const booking = await prisma.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          notes: reason || 'Cancelled by customer'
        },
        include: {
          customer: true,
          service: true,
          payment: true
        }
      });

      // Handle payment refund if applicable
      if (booking.payment && booking.payment.status === 'PAID') {
        // Trigger refund process
        // This would integrate with payment service
      }

      // Send cancellation SMS
      const message = `Your booking for ${booking.service.name} on ${format(booking.date, 'MMM dd, yyyy')} has been cancelled.`;
      await sendSMS(booking.customer.phone, message);

      res.json({
        message: 'Booking cancelled successfully',
        booking
      });
    } catch (error) {
      logger.error('Error cancelling booking:', error);
      res.status(500).json({ error: 'Failed to cancel booking' });
    }
  }

  // Get customer bookings
  async getCustomerBookings(req, res) {
    try {
      const { phone } = req.query;

      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      const customer = await prisma.user.findUnique({
        where: { phone }
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const bookings = await prisma.booking.findMany({
        where: { customerId: customer.id },
        include: {
          service: true,
          barber: true,
          payment: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json({ bookings });
    } catch (error) {
      logger.error('Error getting customer bookings:', error);
      res.status(500).json({ error: 'Failed to get bookings' });
    }
  }

  // Helper methods
  generateTimeSlots(startTime, endTime, serviceDuration, existingBookings) {
    const slots = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let currentTime = new Date();
    currentTime.setHours(startHour, startMinute, 0, 0);
    
    const endTimeDate = new Date();
    endTimeDate.setHours(endHour, endMinute, 0, 0);
    
    while (currentTime < endTimeDate) {
      const timeString = currentTime.toTimeString().substring(0, 5);
      
      // Check if slot is available
      const isBooked = existingBookings.some(booking => {
        return timeString >= booking.startTime && timeString < booking.endTime;
      });
      
      if (!isBooked) {
        slots.push(timeString);
      }
      
      // Add service duration to current time
      currentTime.setMinutes(currentTime.getMinutes() + serviceDuration);
    }
    
    return slots;
  }

  calculateEndTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return endDate.toTimeString().substring(0, 5);
  }

  async checkAvailability(date, startTime, endTime, barberId) {
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: parseISO(date),
        barberId: barberId || undefined,
        status: {
          not: 'CANCELLED'
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          }
        ]
      }
    });

    return !existingBooking;
  }
}

// Validation middleware
const validateBooking = [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerPhone').isMobilePhone().withMessage('Valid phone number is required'),
  body('serviceId').notEmpty().withMessage('Service ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required')
];

module.exports = {
  BookingController: new BookingController(),
  validateBooking
};
