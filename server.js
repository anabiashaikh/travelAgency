const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Database = require('./database');
const EmailService = require('./emailService');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static website files (HTML, CSS, JS, Assets)
app.use(express.static(path.join(__dirname)));

// ─────────────────────────────────────────────────────────────────────────────
// REST API ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

// 1. GET /api/bookings - Get all bookings with optional search & filter
app.get('/api/bookings', (req, res) => {
    try {
        const bookings = Database.getAllBookings();
        const { search, status, property } = req.query;

        let filtered = bookings;

        if (status) {
            filtered = filtered.filter(b => b.status.toLowerCase() === status.toLowerCase());
        }

        if (property) {
            filtered = filtered.filter(b => (b.property || '').toLowerCase().includes(property.toLowerCase()));
        }

        if (search) {
            const term = search.toLowerCase();
            filtered = filtered.filter(b => 
                (b.guestName || '').toLowerCase().includes(term) ||
                (b.phone || '').toLowerCase().includes(term) ||
                (b.email || '').toLowerCase().includes(term) ||
                (b.city || '').toLowerCase().includes(term) ||
                (b.property || '').toLowerCase().includes(term) ||
                (b.id || '').toLowerCase().includes(term)
            );
        }

        res.json({
            success: true,
            count: filtered.length,
            total: bookings.length,
            data: filtered
        });
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).json({ success: false, message: 'Server error retrieving bookings.' });
    }
});

// 2. GET /api/bookings/:id - Get single booking by ID
app.get('/api/bookings/:id', (req, res) => {
    try {
        const booking = Database.getBookingById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }
        res.json({ success: true, data: booking });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error retrieving booking.' });
    }
});

// 3. POST /api/bookings - Create new booking + Trigger STAGE 1 Email
app.post('/api/bookings', async (req, res) => {
    try {
        const data = req.body;

        // Basic validation
        if (!data.phone && !data.email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Phone number or email address is required.' 
            });
        }

        // Save to Database
        const newBooking = Database.createBooking(data);
        console.log(`\n📝 New Booking Saved: #${newBooking.id} (${newBooking.guestName} - ${newBooking.property})`);

        // Trigger Stage 1 Automated Emails in background
        const customerEmailPromise = EmailService.sendStage1InitialEmail(newBooking);
        const adminEmailPromise = EmailService.sendStage1AdminNotification(newBooking);

        const [custRes, adminRes] = await Promise.allSettled([customerEmailPromise, adminEmailPromise]);
        
        let previewUrl = null;
        if (custRes.status === 'fulfilled' && custRes.value && custRes.value.previewUrl) {
            previewUrl = custRes.value.previewUrl;
        }

        res.status(201).json({
            success: true,
            message: 'Booking request received successfully! An acknowledgment email has been dispatched.',
            data: newBooking,
            emailStatus: {
                customerEmail: custRes.status === 'fulfilled' && custRes.value?.success,
                previewUrl: previewUrl
            }
        });
    } catch (err) {
        console.error('Error creating booking:', err);
        res.status(500).json({ success: false, message: 'Server error processing booking.' });
    }
});

// 4. PATCH /api/bookings/:id/status - Update Status + Trigger STAGE 2 Email on 'Confirmed'
app.patch('/api/bookings/:id/status', async (req, res) => {
    try {
        const { status, reason } = req.body;
        if (!status || !['Pending', 'Confirmed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid status. Must be Pending, Confirmed, or Cancelled.' 
            });
        }

        const updatedBooking = Database.updateBookingStatus(req.params.id, status);
        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        console.log(`\n🔄 Booking #${updatedBooking.id} status updated to [${status}].`);

        let emailResult = null;

        // Stage 2 Confirmation Email Trigger
        if (status === 'Confirmed') {
            console.log(`🚀 Sending Official Stage 2 Confirmation Email for #${updatedBooking.id}...`);
            emailResult = await EmailService.sendStage2ConfirmationEmail(updatedBooking);
        } else if (status === 'Cancelled') {
            console.log(`⚠️ Sending Cancellation Email for #${updatedBooking.id}...`);
            emailResult = await EmailService.sendCancellationEmail(updatedBooking, reason);
        }

        res.json({
            success: true,
            message: `Booking status updated to ${status}.${status === 'Confirmed' ? ' Official confirmation email has been sent to the guest.' : ''}`,
            data: updatedBooking,
            emailResult
        });
    } catch (err) {
        console.error('Error updating booking status:', err);
        res.status(500).json({ success: false, message: 'Server error updating status.' });
    }
});

// 5. POST /api/bookings/:id/resend-confirmation - Explicit resend confirmation
app.post('/api/bookings/:id/resend-confirmation', async (req, res) => {
    try {
        const booking = Database.getBookingById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        const result = await EmailService.sendStage2ConfirmationEmail(booking);
        res.json({
            success: true,
            message: 'Confirmation email resent to ' + booking.email,
            result
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to resend confirmation email.' });
    }
});

// 6. DELETE /api/bookings/:id - Delete booking
app.delete('/api/bookings/:id', (req, res) => {
    try {
        const deleted = Database.deleteBooking(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }
        res.json({ success: true, message: 'Booking deleted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error deleting booking.' });
    }
});

// 7. GET /api/email-logs - Fetch recent email logs (for Admin Dashboard)
app.get('/api/email-logs', (req, res) => {
    res.json({
        success: true,
        data: EmailService.getEmailLogs()
    });
});

// Fallback route for SPA / root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Explore Galiyat Server & Database running on http://localhost:${PORT}`);
    console.log(`📊 Admin Reservations Dashboard: http://localhost:${PORT}/admin.html`);
    console.log(`🏨 Maria Villa Page: http://localhost:${PORT}/maria-villa.html`);
    console.log(`👑 Crown Inn Page: http://localhost:${PORT}/crown-inn.html`);
    console.log(`======================================================\n`);
});
