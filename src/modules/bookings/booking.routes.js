const express = require('express');
const router = express.Router();
const BookingController = require('./booking.controller');
const { bookingLimiter } = require('../../middleware/rateLimiter');

// Public customer booking endpoints with rate limiting
router.post('/bookings', bookingLimiter, BookingController.createBooking);
router.get('/bookings/:id/status', BookingController.getPublicBookingStatus);

module.exports = router;
