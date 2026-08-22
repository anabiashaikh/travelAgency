const express = require('express');
const router = express.Router();
const AdminController = require('./admin.controller');
const authenticate = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const { emailResendLimiter } = require('../../middleware/rateLimiter');

// All admin routes require authentication
router.use(authenticate);

// Metrics & Reports (Admin & Manager)
router.get('/metrics', authorize(['admin', 'manager']), AdminController.getMetrics);

// Bookings Management (Admin & Manager)
router.get('/bookings', authorize(['admin', 'manager']), AdminController.getBookings);
router.get('/bookings/:id', authorize(['admin', 'manager']), AdminController.getBookingById);
router.patch('/bookings/:id/status', authorize(['admin', 'manager']), AdminController.updateStatus);
router.post('/bookings/:id/resend-confirmation', authorize(['admin', 'manager']), emailResendLimiter, AdminController.resendConfirmation);

// Destructive Actions (Admin only)
router.delete('/bookings/:id', authorize(['admin']), AdminController.deleteBooking);
router.post('/properties', authorize(['admin']), AdminController.addProperty);

// Logs & Audits (Admin & Manager)
router.get('/email-logs', authorize(['admin', 'manager']), AdminController.getEmailLogs);
router.get('/audit-logs', authorize(['admin']), AdminController.getAuditLogs);

module.exports = router;
