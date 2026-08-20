const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');

// ─── BOOKINGS REST API ROUTES ────────────────────────────────────────────────

// GET /api/bookings - Retrieve all bookings
router.get('/bookings', BookingController.getAllBookings);

// GET /api/bookings/:id - Retrieve single booking by ID
router.get('/bookings/:id', BookingController.getBookingById);

// POST /api/bookings - Create a new booking request (Triggers Stage 1 Email)
router.post('/bookings', BookingController.createBooking);

// PATCH /api/bookings/:id/status - Update booking status (Triggers Stage 2 Voucher on "Confirmed")
router.patch('/bookings/:id/status', BookingController.updateBookingStatus);

// POST /api/bookings/:id/resend-confirmation - Resend official confirmation email
router.post('/bookings/:id/resend-confirmation', BookingController.resendConfirmationEmail);

// DELETE /api/bookings/:id - Delete a booking
router.delete('/bookings/:id', BookingController.deleteBooking);

// GET /api/email-logs - Retrieve automated email dispatch history
router.get('/email-logs', BookingController.getEmailLogs);

module.exports = router;
