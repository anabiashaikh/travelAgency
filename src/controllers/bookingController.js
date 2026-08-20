const Database = require('../config/database');
const EmailService = require('../services/emailService');

const BookingController = {
    // 1. GET ALL BOOKINGS
    async getAllBookings(req, res) {
        try {
            const bookings = Database.getAllBookings();
            return res.json({
                success: true,
                count: bookings.length,
                data: bookings
            });
        } catch (err) {
            console.error('Error fetching bookings:', err);
            return res.status(500).json({ success: false, message: 'Failed to retrieve bookings', error: err.message });
        }
    },

    // 2. GET BOOKING BY ID
    async getBookingById(req, res) {
        try {
            const booking = Database.getBookingById(req.params.id);
            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            return res.json({ success: true, data: booking });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Error retrieving booking', error: err.message });
        }
    },

    // 3. CREATE BOOKING (Stage 1: Save + Instant Acknowledgment & Admin Alert)
    async createBooking(req, res) {
        try {
            const bookingData = req.body;
            if (!bookingData.guestName && !bookingData.firstName && !bookingData.phone) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: Guest Name / First Name and Phone number are required.'
                });
            }

            // Save to database
            const newBooking = Database.createBooking(bookingData);
            console.log(`\n📝 New Booking Saved: #${newBooking.id} (${newBooking.guestName} - ${newBooking.property})`);

            // Dispatch Stage 1 Customer Acknowledgment Email
            let emailResult = null;
            if (newBooking.email) {
                emailResult = await EmailService.sendStage1InitialEmail(newBooking);
            }

            // Dispatch Stage 1 Admin Notification
            EmailService.sendStage1AdminNotification(newBooking).catch(err => 
                console.warn('Admin notification email warning:', err.message)
            );

            return res.status(201).json({
                success: true,
                message: 'Booking request received successfully! An acknowledgment email has been dispatched.',
                data: newBooking,
                emailStatus: {
                    customerEmail: !!newBooking.email,
                    previewUrl: emailResult?.previewUrl || null
                }
            });
        } catch (err) {
            console.error('Error creating booking:', err);
            return res.status(500).json({ success: false, message: 'Failed to process booking', error: err.message });
        }
    },

    // 4. UPDATE BOOKING STATUS (Stage 2: On "Confirmed", send Official Voucher)
    async updateBookingStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;

            if (!status) {
                return res.status(400).json({ success: false, message: 'Status is required.' });
            }

            const updatedBooking = Database.updateBookingStatus(id, status);
            if (!updatedBooking) {
                return res.status(404).json({ success: false, message: `Booking #${id} not found.` });
            }

            console.log(`\n🔄 Booking #${id} status updated to [${status}].`);
            let emailResult = null;

            // Trigger Stage 2 confirmation voucher email
            if (status === 'Confirmed' && updatedBooking.email) {
                console.log(`🚀 Sending Official Stage 2 Confirmation Email for #${id}...`);
                emailResult = await EmailService.sendStage2ConfirmationEmail(updatedBooking);
            } else if (status === 'Cancelled' && updatedBooking.email) {
                console.log(`Sending Cancellation Notice for #${id}...`);
                emailResult = await EmailService.sendCancellationEmail(updatedBooking, reason);
            }

            return res.json({
                success: true,
                message: `Booking status updated to ${status}.${status === 'Confirmed' ? ' Official confirmation email has been sent to the guest.' : ''}`,
                data: updatedBooking,
                emailResult: emailResult ? {
                    success: emailResult.success,
                    messageId: emailResult.messageId,
                    previewUrl: emailResult.previewUrl || false
                } : null
            });
        } catch (err) {
            console.error('Error updating booking status:', err);
            return res.status(500).json({ success: false, message: 'Failed to update booking status', error: err.message });
        }
    },

    // 5. RESEND CONFIRMATION EMAIL
    async resendConfirmationEmail(req, res) {
        try {
            const { id } = req.params;
            const booking = Database.getBookingById(id);
            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            if (!booking.email) {
                return res.status(400).json({ success: false, message: 'No email address registered for this booking' });
            }

            const result = await EmailService.sendStage2ConfirmationEmail(booking);
            return res.json({
                success: true,
                message: `Confirmation email resent to ${booking.email}`,
                previewUrl: result?.previewUrl || null
            });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to resend confirmation email', error: err.message });
        }
    },

    // 6. DELETE BOOKING
    async deleteBooking(req, res) {
        try {
            const { id } = req.params;
            const success = Database.deleteBooking(id);
            if (!success) {
                return res.status(404).json({ success: false, message: 'Booking not found or already deleted.' });
            }
            return res.json({ success: true, message: `Booking #${id} successfully deleted.` });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to delete booking', error: err.message });
        }
    },

    // 7. GET EMAIL LOGS
    async getEmailLogs(req, res) {
        try {
            const logs = EmailService.getEmailLogs();
            return res.json({ success: true, count: logs.length, data: logs });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to retrieve email logs' });
        }
    }
};

module.exports = BookingController;
