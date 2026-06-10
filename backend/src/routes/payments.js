const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');

const prisma = new PrismaClient();

// Global variable to hold io instance (will be set by server.js)
let io;

// Set io instance for real-time updates
const setSocketIO = (ioInstance) => {
  io = ioInstance;
};

// Get all payments with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      method,
      startDate,
      endDate
    } = req.query;

    const skip = (page - 1) * limit;
    const take = Math.min(parseInt(limit), 100); // Max 100 per request

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (method) where.method = method;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              customer: {
                select: {
                  name: true,
                  phone: true
                }
              },
              service: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    // Format payments for frontend
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      bookingId: payment.bookingId,
      customer: payment.booking.customer.name,
      service: payment.booking.service.name,
      amount: `₵${(payment.amount / 100).toFixed(2)}`,
      method: payment.method,
      status: payment.status,
      date: payment.createdAt,
      paidAt: payment.paidAt,
      reference: payment.reference
    }));

    res.json({
      success: true,
      data: {
        payments: formattedPayments,
        pagination: {
          page: parseInt(page),
          limit: take,
          total: totalCount,
          pages: Math.ceil(totalCount / take)
        }
      }
    });

  } catch (error) {
    logger.error('Get payments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payments' 
    });
  }
});

// Get today's payment statistics
router.get('/stats/today', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const [totalRevenue, paymentCount, byMethod, byStatus] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          },
          status: 'PAID'
        },
        _sum: { amount: true }
      }),
      prisma.payment.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      }),
      prisma.payment.groupBy({
        by: ['method'],
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        _count: { method: true },
        _sum: { amount: true }
      }),
      prisma.payment.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        },
        _count: { status: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: (totalRevenue._sum.amount || 0) / 100,
        paymentCount,
        byMethod: byMethod.map(item => ({
          method: item.method,
          count: item._count.method,
          amount: (item._sum.amount || 0) / 100
        })),
        byStatus: byStatus.map(item => ({
          status: item.status,
          count: item._count.status
        }))
      }
    });

  } catch (error) {
    logger.error('Get payment stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment statistics' 
    });
  }
});

// Process a new payment
router.post('/process', async (req, res) => {
  try {
    const {
      bookingId,
      method,
      reference,
      amount
    } = req.body;

    // Validate required fields
    if (!bookingId || !method || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'BookingId, method, and amount are required' 
      });
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { name: true, phone: true } },
        service: { select: { name: true, price: true } }
      }
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Create payment record
    const paymentNumber = 'PAY-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        customerId: booking.customerId,
        amount: parseInt(amount), // Amount in kobo
        method,
        reference,
        paymentNumber,
        status: 'PAID',
        paidAt: new Date()
      }
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' }
    });

    // Emit real-time update
    if (io) {
      const paymentUpdate = {
        id: payment.id,
        bookingId: payment.bookingId,
        customer: booking.customer.name,
        service: booking.service.name,
        amount: `₵${(payment.amount / 100).toFixed(2)}`,
        method: payment.method,
        status: payment.status,
        date: payment.createdAt,
        reference: payment.reference
      };
      
      io.emit('payment_created', paymentUpdate);
      io.emit('booking_updated', {
        id: bookingId,
        status: 'CONFIRMED'
      });
    }

    logger.info(`Payment processed: ${payment.id} for booking ${bookingId}`);

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId: payment.id,
        status: 'PAID',
        amount: payment.amount / 100
      }
    });

  } catch (error) {
    logger.error('Process payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process payment' 
    });
  }
});

// Update payment status (for webhooks, refunds, etc.)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status,
        ...(status === 'REFUNDED' && { refundedAt: new Date() })
      },
      include: {
        booking: {
          include: {
            customer: { select: { name: true } },
            service: { select: { name: true } }
          }
        }
      }
    });

    // Emit real-time update
    if (io) {
      const paymentUpdate = {
        id: payment.id,
        bookingId: payment.bookingId,
        customer: payment.booking.customer.name,
        service: payment.booking.service.name,
        amount: `₵${(payment.amount / 100).toFixed(2)}`,
        method: payment.method,
        status: payment.status,
        date: payment.createdAt,
        reference: payment.reference
      };
      
      io.emit('payment_updated', paymentUpdate);
    }

    logger.info(`Payment status updated: ${id} -> ${status}`);

    res.json({
      success: true,
      message: 'Payment status updated successfully'
    });

  } catch (error) {
    logger.error('Update payment status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update payment status' 
    });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Payments routes working!', timestamp: new Date().toISOString() });
});

module.exports = { router, setSocketIO };
