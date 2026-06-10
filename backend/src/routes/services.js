const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getServicesForBooking,
  getServiceById,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  getAllServicesForAdmin
} = require('../controllers/servicesController');

// Public routes
router.get('/', getAllServices);
router.get('/booking', getServicesForBooking); // Simplified format for booking forms
router.get('/:id', getServiceById);

// Admin routes (Note: Add authentication middleware in production)
router.get('/admin/all', getAllServicesForAdmin);
router.post('/', createService);
router.put('/:id', updateService);
router.patch('/:id/toggle', toggleServiceStatus);
router.delete('/:id', deleteService);

// Test route
router.get('/test/health', (req, res) => {
  res.json({ 
    message: 'Services API is working!', 
    timestamp: new Date().toISOString(),
    endpoints: {
      public: [
        'GET /',
        'GET /booking',
        'GET /:id'
      ],
      admin: [
        'GET /admin/all',
        'POST /',
        'PUT /:id',
        'PATCH /:id/toggle',
        'DELETE /:id'
      ]
    }
  });
});

module.exports = router;
