const express = require('express');
const router = express.Router();
const logger = require('../config/logger');

// GET /api/bookings/test - Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Booking routes working!', timestamp: new Date().toISOString() });
});

// GET /api/bookings - Get all bookings (placeholder)
router.get('/', (req, res) => {
  logger.info('Fetching bookings');
  res.status(501).json({ 
    message: 'Get bookings endpoint not yet implemented',
    note: 'This is a placeholder during development setup'
  });
});

// POST /api/bookings - Create booking (placeholder)
router.post('/', (req, res) => {
  logger.info('Creating booking:', req.body);
  res.status(501).json({ 
    message: 'Create booking endpoint not yet implemented',
    note: 'This is a placeholder during development setup'
  });
});

module.exports = router;
