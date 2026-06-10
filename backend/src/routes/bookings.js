const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookingController');

const { BookingController, validateBooking } = ctrl;

const wrap = (fn) => (req, res, next) => fn.call(BookingController, req, res, next);

// GET /api/bookings/test - Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Booking routes working!', timestamp: new Date().toISOString() });
});

// GET /api/bookings - Get all bookings (admin)
router.get('/', wrap(BookingController.getBookings));

// GET /api/bookings/available-slots - Get available time slots
router.get('/available-slots', wrap(BookingController.getAvailableSlots));

// GET /api/bookings/customer - Get customer bookings by phone
router.get('/customer', wrap(BookingController.getCustomerBookings));

// GET /api/bookings/:id - Get booking details
router.get('/:id', wrap(BookingController.getBooking));

// POST /api/bookings - Create booking
router.post('/', validateBooking, wrap(BookingController.createBooking));

// PATCH /api/bookings/:id/status - Update booking status
router.patch('/:id/status', wrap(BookingController.updateBookingStatus));

// POST /api/bookings/:id/cancel - Cancel booking
router.post('/:id/cancel', wrap(BookingController.cancelBooking));

module.exports = router;
