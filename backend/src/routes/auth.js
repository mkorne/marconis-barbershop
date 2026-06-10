const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// GET /api/auth/test - Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working!', timestamp: new Date().toISOString() });
});

// POST /api/auth/login - Customer login by phone number
router.post('/login', login);

// POST /api/auth/register - Customer registration
router.post('/register', register);

module.exports = router;
