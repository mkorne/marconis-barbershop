const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');

const prisma = new PrismaClient();

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-auth-token') ||
                  req.cookies?.adminToken;

    if (!token) {
      return res.status(401).json({ message: 'No token provided, access denied' });
    }

    // Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    const decoded = jwt.verify(token, secret);
    
    // Check if admin still exists and is active
    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.adminId },
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true
      }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Admin not found, access denied' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ message: 'Account is disabled, access denied' });
    }

    // Attach admin info to request
    req.admin = {
      adminId: admin.id,
      username: admin.username,
      role: admin.role
    };

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    logger.error('Admin auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to check for specific admin roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = {
  authenticateAdmin,
  requireRole
};
