const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const logger = require('../config/logger');

const prisma = new PrismaClient();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
};

const generateToken = (userId, phone, role) => {
  return jwt.sign({ userId, phone, role }, getJwtSecret(), { expiresIn: '30d' });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone number are required' });
    }

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const user = await prisma.user.create({ data: { name, phone, email: email || null } });

    const token = generateToken(user.id, user.phone, user.role);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role }
    });
  } catch (error) {
    logger.error('Customer registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(401).json({ message: 'No account found with this phone number' });
    }

    const token = generateToken(user.id, user.phone, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role }
    });
  } catch (error) {
    logger.error('Customer login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { register, login };