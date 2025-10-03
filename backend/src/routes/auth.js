const express = require('express');
const router = express.Router();
const logger = require('../config/logger');

// GET /api/auth/test - Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working!', timestamp: new Date().toISOString() });
});

// POST /api/auth/login - Login endpoint (placeholder)
router.post('/login', (req, res) => {
  logger.info('Login attempt:', { email: req.body.email });
  res.status(501).json({ 
    message: 'Login endpoint not yet implemented',
    note: 'This is a placeholder during development setup'
  });
});

// POST /api/auth/register - Register endpoint (placeholder)
router.post('/register', (req, res) => {
  logger.info('Registration attempt:', { email: req.body.email });
  res.status(501).json({ 
    message: 'Register endpoint not yet implemented',
    note: 'This is a placeholder during development setup'
  });
});

module.exports = router;
