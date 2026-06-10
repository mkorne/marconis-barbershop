const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');

const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (adminId, username, role) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign(
    { adminId, username, role },
    secret,
    { expiresIn: '24h' }
  );
};

// Admin login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find admin user
    const admin = await prisma.adminUser.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ message: 'Account is disabled' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    // Generate token
    const token = generateToken(admin.id, admin.username, admin.role);

    logger.info(`Admin login successful: ${username}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error) {
    logger.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin registration (for creating new admin users)
const register = async (req, res) => {
  try {
    const { username, password, name, role = 'STAFF' } = req.body;

    // Validate input
    if (!username || !password || !name) {
      return res.status(400).json({ message: 'Username, password, and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if username already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const admin = await prisma.adminUser.create({
      data: {
        username: username.toLowerCase(),
        password: hashedPassword,
        name,
        role: role.toUpperCase()
      }
    });

    logger.info(`New admin user created: ${username}`);

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (error) {
    logger.error('Admin registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get dashboard data
const getDashboard = async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get statistics
    const [
      todayBookings,
      todayRevenue,
      unreadMessages,
      totalBookings,
      totalCustomers,
      recentBookings,
      recentPayments,
      recentMessages
    ] = await Promise.all([
      // Today's bookings count
      prisma.booking.count({
        where: {
          date: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      }),

      // Today's revenue
      prisma.payment.aggregate({
        where: {
          paidAt: {
            gte: startOfDay,
            lt: endOfDay
          },
          status: 'PAID'
        },
        _sum: {
          amount: true
        }
      }),

      // Unread messages count
      prisma.message.count({
        where: {
          status: 'UNREAD'
        }
      }),

      // Total bookings count
      prisma.booking.count(),

      // Total customers count
      prisma.user.count({
        where: {
          role: 'CUSTOMER'
        }
      }),

      // Recent bookings (last 10)
      prisma.booking.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          customer: {
            select: {
              name: true,
              phone: true
            }
          },
          service: {
            select: {
              name: true,
              price: true
            }
          },
          barber: {
            select: {
              name: true
            }
          }
        }
      }),

      // Recent payments (last 10)
      prisma.payment.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          booking: {
            include: {
              customer: {
                select: {
                  name: true
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

      // Recent messages (last 10)
      prisma.message.findMany({
        take: 10,
        orderBy: {
          sentAt: 'desc'
        },
        include: {
          customer: {
            select: {
              name: true,
              phone: true
            }
          }
        }
      })
    ]);

    // Format revenue (convert from cents to currency)
    const todayRevenueAmount = todayRevenue._sum.amount || 0;

    const dashboardData = {
      stats: {
        todayBookings,
        todayRevenue: todayRevenueAmount / 100, // Convert from cents
        unreadMessages,
        totalBookings,
        totalCustomers
      },
      recentBookings: recentBookings.map(booking => ({
        id: booking.id,
        customer: booking.customer.name,
        service: booking.service.name,
        barber: booking.barber?.name || 'Not assigned',
        date: booking.date,
        startTime: booking.startTime,
        status: booking.status,
        amount: booking.service.price / 100 // Convert from cents
      })),
      recentPayments: recentPayments.map(payment => ({
        id: payment.id,
        customer: payment.booking.customer.name,
        service: payment.booking.service.name,
        amount: payment.amount / 100, // Convert from cents
        method: payment.method,
        status: payment.status,
        date: payment.createdAt
      })),
      recentMessages: recentMessages.map(message => ({
        id: message.id,
        customer: message.customer.name,
        phone: message.customer.phone,
        content: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
        status: message.status,
        sentAt: message.sentAt
      }))
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    logger.error('Dashboard data error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify token and get admin profile
const getProfile = async (req, res) => {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.admin.adminId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        lastLogin: true
      }
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      success: true,
      admin
    });

  } catch (error) {
    logger.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  login,
  register,
  getDashboard,
  getProfile
};
