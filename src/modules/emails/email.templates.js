/**
 * Helper to escape HTML characters and prevent XSS injection
 */
function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

const EmailTemplates = {
    escapeHtml,

    getStage1CustomerEmail(booking) {
        const guestName = escapeHtml(booking.guestName || `${booking.firstName || ''} ${booking.lastName || ''}`.trim() || 'Valued Guest');
        const bookingId = escapeHtml(booking.id || '');
        const property = escapeHtml(booking.property || booking.propertyName || 'Galiyat Stay');
        const roomType = escapeHtml(booking.roomType || booking.roomTypeName || 'Standard Suite');
        const datetime = escapeHtml(booking.datetime || booking.datetimeText || booking.checkInDate || 'Upcoming Stay');
        const totalPrice = Number(booking.totalPrice || 0).toLocaleString();
        const specialRequests = escapeHtml(booking.specialRequests || 'None');

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
                .header { background: #0f172a; padding: 24px 30px; text-align: center; border-bottom: 4px solid #047857; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; }
                .header p { color: #a7f3d0; margin: 6px 0 0 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
                .content { padding: 30px; }
                .badge-pending { background: #fef3c7; color: #b45309; font-weight: 800; font-size: 12px; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; display: inline-block; }
                .notice-box { background: #f0fdf4; border-left: 4px solid #047857; padding: 16px 20px; border-radius: 6px; margin: 20px 0; }
                .notice-box p { margin: 0; color: #065f46; font-size: 14px; line-height: 1.6; }
                .summary-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
                .summary-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; }
                .summary-table td.label { font-weight: 600; color: #64748b; width: 40%; }
                .summary-table td.value { font-weight: 700; color: #0f172a; }
                .total-row td { background: #f8fafc; font-size: 16px; font-weight: 800; color: #047857; border-top: 2px solid #e2e8f0; }
                .footer { background: #0f172a; padding: 20px 30px; text-align: center; color: #94a3b8; font-size: 12px; }
                .footer a { color: #34d399; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Explore Galiyat</h1>
                    <p>Booking Request Received</p>
                </div>
                <div class="content">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="margin: 0; color: #0f172a;">Dear ${guestName},</h2>
                        <span class="badge-pending">Pending Verification</span>
                    </div>
                    <p style="color: #475569; line-height: 1.6; margin-top: 14px;">
                        Thank you for booking with Explore Galiyat! We have received your reservation request for <strong>${property}</strong>. Our reservations desk is currently reviewing room availability and preparing your itinerary.
                    </p>
                    <div class="notice-box">
                        <p><strong>Next Step:</strong> You will receive an official confirmed booking voucher via email once our team verifies room readiness.</p>
                    </div>
                    <table class="summary-table">
                        <tr><td class="label">Booking Reference:</td><td class="value">#${bookingId}</td></tr>
                        <tr><td class="label">Property / Hotel:</td><td class="value">${property}</td></tr>
                        <tr><td class="label">Room / Apartment:</td><td class="value">${roomType}</td></tr>
                        <tr><td class="label">Check-in Date/Time:</td><td class="value">${datetime}</td></tr>
                        <tr><td class="label">Special Requests:</td><td class="value">${specialRequests}</td></tr>
                        <tr class="total-row"><td class="label">Estimated Total:</td><td class="value">PKR ${totalPrice}</td></tr>
                    </table>
                </div>
                <div class="footer">
                    <p>&copy; 2026 Explore Galiyat &bull; Pakistan's Premier Mountain Tourism Platform</p>
                </div>
            </div>
        </body>
        </html>
        `;
    },

    getStage1AdminAlert(booking) {
        const guestName = escapeHtml(booking.guestName || '');
        const phone = escapeHtml(booking.phone || 'N/A');
        const email = escapeHtml(booking.email || 'N/A');
        const bookingId = escapeHtml(booking.id || '');
        const property = escapeHtml(booking.property || booking.propertyName || '');
        const roomType = escapeHtml(booking.roomType || booking.roomTypeName || '');
        const totalPrice = Number(booking.totalPrice || 0).toLocaleString();

        return `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8fafc; color: #1e293b;">
            <div style="max-width: 550px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px;">
                <h2 style="color: #047857; margin-top: 0;">🔔 New Reservation Request #${bookingId}</h2>
                <p>A new customer booking has been received on Explore Galiyat.</p>
                <ul>
                    <li><strong>Guest:</strong> ${guestName}</li>
                    <li><strong>Phone:</strong> ${phone}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Property:</strong> ${property} (${roomType})</li>
                    <li><strong>Total:</strong> PKR ${totalPrice}</li>
                </ul>
                <p><a href="https://travel-agency-ten-chi.vercel.app/admin.html" style="display: inline-block; background: #047857; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold;">Open Admin Dashboard</a></p>
            </div>
        </div>
        `;
    },

    getStage2ConfirmationVoucher(booking) {
        const guestName = escapeHtml(booking.guestName || '');
        const bookingId = escapeHtml(booking.id || '');
        const property = escapeHtml(booking.property || booking.propertyName || 'Galiyat Property');
        const roomType = escapeHtml(booking.roomType || booking.roomTypeName || 'Standard Room');
        const datetime = escapeHtml(booking.datetime || booking.datetimeText || booking.checkInDate || 'Upcoming');
        const totalPrice = Number(booking.totalPrice || 0).toLocaleString();

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
                .voucher { max-width: 600px; margin: 0 auto; background: #ffffff; border: 2px solid #059669; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
                .header { background: #059669; color: #ffffff; padding: 24px; text-align: center; }
                .content { padding: 28px; }
                .badge-confirmed { background: #d1fae5; color: #065f46; font-size: 14px; font-weight: 800; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; }
                .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
                .total { background: #f0fdf4; font-weight: bold; color: #065f46; font-size: 16px; }
            </style>
        </head>
        <body>
            <div class="voucher">
                <div class="header">
                    <h1 style="margin: 0; font-size: 22px;">OFFICIAL BOOKING CONFIRMATION VOUCHER</h1>
                    <p style="margin: 4px 0 0 0; font-size: 14px;">Explore Galiyat Reservations Desk</p>
                </div>
                <div class="content">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span class="badge-confirmed">✔ RESERVATION CONFIRMED</span>
                    </div>
                    <p>Dear <strong>${guestName}</strong>,</p>
                    <p>Your reservation for <strong>${property}</strong> has been officially confirmed. Please present this voucher reference upon check-in at the hotel front desk.</p>
                    <table class="table">
                        <tr><td><strong>Booking Reference:</strong></td><td>#${bookingId}</td></tr>
                        <tr><td><strong>Property:</strong></td><td>${property}</td></tr>
                        <tr><td><strong>Room Type:</strong></td><td>${roomType}</td></tr>
                        <tr><td><strong>Check-in Date:</strong></td><td>${datetime}</td></tr>
                        <tr class="total"><td><strong>Total Amount:</strong></td><td>PKR ${totalPrice}</td></tr>
                    </table>
                    <p style="font-size: 13px; color: #475569;">For assistance during your journey, contact our 24/7 Galiyat Tourist Helpline at +92 300 1234567.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    },

    getCancellationNotice(booking, reason) {
        const guestName = escapeHtml(booking.guestName || '');
        const bookingId = escapeHtml(booking.id || '');
        const property = escapeHtml(booking.property || booking.propertyName || '');
        const cleanReason = escapeHtml(reason || 'Cancelled upon guest or property request.');

        return `
        <div style="font-family: Arial, sans-serif; padding: 24px; background: #f8fafc; color: #1e293b;">
            <div style="max-width: 550px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
                <h2 style="color: #dc2626; margin-top: 0;">Reservation Cancelled (#${bookingId})</h2>
                <p>Dear <strong>${guestName}</strong>,</p>
                <p>Your booking for <strong>${property}</strong> has been cancelled.</p>
                <p><strong>Reason:</strong> ${cleanReason}</p>
                <p>If you have any questions, please contact our support team at reservations@exploregaliyat.com.</p>
            </div>
        </div>
        `;
    }
};

module.exports = EmailTemplates;
