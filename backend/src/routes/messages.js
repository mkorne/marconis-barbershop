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

// Get all messages with pagination and filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      startDate,
      endDate
    } = req.query;

    const skip = (page - 1) * limit;
    const take = Math.min(parseInt(limit), 100); // Max 100 per request

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.sentAt = {};
      if (startDate) where.sentAt.gte = new Date(startDate);
      if (endDate) where.sentAt.lte = new Date(endDate);
    }

    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take,
        orderBy: { sentAt: 'desc' },
        include: {
          customer: {
            select: {
              name: true,
              phone: true,
              email: true
            }
          }
        }
      }),
      prisma.message.count({ where })
    ]);

    // Format messages for frontend
    const formattedMessages = messages.map(message => ({
      id: message.id,
      customer: message.customer.name,
      phone: message.customer.phone,
      email: message.customer.email,
      content: message.content,
      type: message.type,
      status: message.status,
      sentAt: message.sentAt,
      readAt: message.readAt,
      repliedAt: message.repliedAt,
      reply: message.reply
    }));

    res.json({
      success: true,
      data: {
        messages: formattedMessages,
        pagination: {
          page: parseInt(page),
          limit: take,
          total: totalCount,
          pages: Math.ceil(totalCount / take)
        }
      }
    });

  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch messages' 
    });
  }
});

// Get message statistics
router.get('/stats', async (req, res) => {
  try {
    const [unreadCount, totalCount, byType, byStatus] = await Promise.all([
      prisma.message.count({
        where: { status: 'UNREAD' }
      }),
      prisma.message.count(),
      prisma.message.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      prisma.message.groupBy({
        by: ['status'],
        _count: { status: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        unreadCount,
        totalCount,
        byType: byType.map(item => ({
          type: item.type,
          count: item._count.type
        })),
        byStatus: byStatus.map(item => ({
          status: item.status,
          count: item._count.status
        }))
      }
    });

  } catch (error) {
    logger.error('Get message stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch message statistics' 
    });
  }
});

// Create a new message
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      content,
      type = 'CUSTOMER_SUPPORT'
    } = req.body;

    // Validate required fields
    if (!customerId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'CustomerId and content are required' 
      });
    }

    // Verify customer exists
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { name: true, phone: true, email: true }
    });

    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

    // Create message
    const messageNumber = 'MSG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const message = await prisma.message.create({
      data: {
        customerId,
        content,
        type,
        messageNumber,
        status: 'UNREAD'
      }
    });

    // Emit real-time update
    if (io) {
      const messageUpdate = {
        id: message.id,
        customer: customer.name,
        phone: customer.phone,
        email: customer.email,
        content: message.content,
        type: message.type,
        status: message.status,
        sentAt: message.sentAt
      };
      
      io.emit('message_created', messageUpdate);
    }

    logger.info(`New message created: ${message.id} from customer ${customerId}`);

    res.status(201).json({
      success: true,
      message: 'Message created successfully',
      data: { messageId: message.id }
    });

  } catch (error) {
    logger.error('Create message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create message' 
    });
  }
});

// Mark message as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.update({
      where: { id },
      data: { 
        status: 'READ',
        readAt: new Date()
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    // Emit real-time update
    if (io) {
      const messageUpdate = {
        id: message.id,
        customer: message.customer.name,
        phone: message.customer.phone,
        email: message.customer.email,
        content: message.content,
        type: message.type,
        status: message.status,
        sentAt: message.sentAt,
        readAt: message.readAt
      };
      
      io.emit('message_updated', messageUpdate);
    }

    logger.info(`Message marked as read: ${id}`);

    res.json({
      success: true,
      message: 'Message marked as read'
    });

  } catch (error) {
    logger.error('Mark message as read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark message as read' 
    });
  }
});

// Reply to a message
router.post('/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reply content is required' 
      });
    }

    const message = await prisma.message.update({
      where: { id },
      data: { 
        reply,
        status: 'REPLIED',
        repliedAt: new Date()
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    // Emit real-time update
    if (io) {
      const messageUpdate = {
        id: message.id,
        customer: message.customer.name,
        phone: message.customer.phone,
        email: message.customer.email,
        content: message.content,
        type: message.type,
        status: message.status,
        sentAt: message.sentAt,
        readAt: message.readAt,
        repliedAt: message.repliedAt,
        reply: message.reply
      };
      
      io.emit('message_updated', messageUpdate);
    }

    logger.info(`Message replied: ${id}`);

    res.json({
      success: true,
      message: 'Reply sent successfully'
    });

  } catch (error) {
    logger.error('Reply to message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send reply' 
    });
  }
});

// Get a specific message
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    const formattedMessage = {
      id: message.id,
      customer: message.customer.name,
      phone: message.customer.phone,
      email: message.customer.email,
      content: message.content,
      type: message.type,
      status: message.status,
      sentAt: message.sentAt,
      readAt: message.readAt,
      repliedAt: message.repliedAt,
      reply: message.reply
    };

    res.json({
      success: true,
      data: formattedMessage
    });

  } catch (error) {
    logger.error('Get message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch message' 
    });
  }
});

// Delete a message (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.message.delete({
      where: { id }
    });

    // Emit real-time update
    if (io) {
      io.emit('message_deleted', { id });
    }

    logger.info(`Message deleted: ${id}`);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    logger.error('Delete message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete message' 
    });
  }
});

module.exports = { router, setSocketIO };
