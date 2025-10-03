const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateAdmin, requireRole } = require('../middleware/adminAuth');

// Public routes (no authentication required)
router.post('/login', adminController.login);
router.post('/register', adminController.register);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Admin routes working!', timestamp: new Date().toISOString() });
});

// Protected routes (authentication required)
router.get('/profile', authenticateAdmin, adminController.getProfile);
router.get('/dashboard', authenticateAdmin, adminController.getDashboard);

// Super admin only routes
router.get('/users', authenticateAdmin, requireRole(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  res.status(501).json({ message: 'User management endpoint not yet implemented' });
});

module.exports = router;
