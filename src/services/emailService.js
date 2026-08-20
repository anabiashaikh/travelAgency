const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = null;
let etherealAccount = null;
const emailLogs = [];

// Initialize Email Transporter
async function getTransporter() {
    if (transporter) return transporter;

    // Check if custom SMTP / Gmail is configured in .env
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        if (process.env.SMTP_SERVICE === 'gmail' || (process.env.SMTP_USER && process.env.SMTP_USER.includes('@gmail.com'))) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER.trim(),
                    pass: process.env.SMTP_PASS.replace(/\s+/g, '').trim()
                }
            });
            console.log(`📧 Configured Real Gmail SMTP for ${process.env.SMTP_USER}.`);
        } else {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
            console.log(`📧 Configured custom SMTP email service (${process.env.SMTP_HOST || 'Gmail'}).`);
        }
    } else {
        // Fallback to test SMTP account if credentials not yet supplied in .env
        try {
            etherealAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: etherealAccount.user,
                    pass: etherealAccount.pass
                }
            });
            console.log(`ℹ️ Real Gmail password not set in .env yet. Running in preview mode. All alerts will be sent to ${process.env.ADMIN_NOTIFICATION_EMAIL || 'anabiaxhaikh190@gmail.com'}.`);
        } catch (err) {
            console.warn('⚠️ Could not initialize test account:', err.message);
            transporter = nodemailer.createTransport({
                jsonTransport: true
            });
        }
    }

    return transporter;
}

// Helper to record email logs
function logEmail(type, to, subject, previewUrl = null, error = null) {
    const entry = {
        id: Date.now().toString(36),
        type,
        to,
        subject,
        previewUrl,
        sentAt: new Date().toISOString(),
        status: error ? 'Failed' : 'Sent',
        error: error ? error.message : null
    };
    emailLogs.unshift(entry);
    if (emailLogs.length > 50) emailLogs.pop();
    return entry;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. STAGE 1: INITIAL BOOKING ACKNOWLEDGMENT EMAIL (TO CUSTOMER)
// ─────────────────────────────────────────────────────────────────────────────
async function sendStage1InitialEmail(booking) {
    if (!booking.email) {
        console.log(`ℹ️ No customer email provided for booking #${booking.id}, skipping customer email.`);
        return null;
    }

    const mailer = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || `"Explore Galiyat Reservations" <${process.env.SMTP_USER || 'reservations@exploregaliyat.com'}>`;
    const subject = `Booking Request Received: ${booking.property} (#${booking.id}) - Explore Galiyat`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
            .header { background: #0f172a; padding: 24px 30px; text-align: center; border-bottom: 4px solid #047857; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
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
            .steps-box { background: #f8fafc; border-radius: 8px; padding: 18px 22px; margin: 24px 0; }
            .steps-box h4 { margin: 0 0 10px 0; font-size: 14px; color: #0f172a; }
            .steps-box ol { margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.6; }
            .footer { background: #0f172a; padding: 20px 30px; text-align: center; color: #94a3b8; font-size: 12px; }
            .footer a { color: #10b981; text-decoration: none; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Explore Galiyat</h1>
                <p>Hotels, Villas &amp; Mountain Tours</p>
            </div>
            
            <div class="content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <span class="badge-pending">⏳ Verification in Progress</span>
                    <span style="font-size: 13px; color: #64748b; font-weight: 600;">Ref: #${booking.id}</span>
                </div>

                <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 8px;">Thank You for Your Booking Request, ${booking.firstName || booking.guestName}!</h2>
                <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 16px;">
                    We have successfully received your reservation request for <strong>${booking.property}</strong> in Galiyat.
                </p>

                <div class="notice-box">
                    <p>
                        <strong>🔍 What happens next?</strong><br>
                        Our team is currently verifying exact room &amp; date availability with the property management. 
                        <strong>We will contact you shortly via call, WhatsApp, or email</strong> once confirmed. You will receive your official booking confirmation voucher immediately after verification.
                    </p>
                </div>

                <h3 style="font-size: 15px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin: 24px 0 12px;">Reservation Summary</h3>
                <table class="summary-table">
                    <tr>
                        <td class="label">Property / Stay:</td>
                        <td class="value">${booking.property}</td>
                    </tr>
                    <tr>
                        <td class="label">Room / Unit Type:</td>
                        <td class="value">${booking.roomType || 'Standard Unit'}</td>
                    </tr>
                    <tr>
                        <td class="label">Dates &amp; Time:</td>
                        <td class="value">${booking.datetime || `${booking.checkInDate || ''} to ${booking.checkOutDate || ''}`}</td>
                    </tr>
                    <tr>
                        <td class="label">Guests:</td>
                        <td class="value">${booking.guestsCount || '2 adults'}</td>
                    </tr>
                    <tr>
                        <td class="label">Guest Contact:</td>
                        <td class="value">${booking.phone} (${booking.city || 'Pakistan'})</td>
                    </tr>
                    ${booking.specialRequests ? `
                    <tr>
                        <td class="label">Special Requests:</td>
                        <td class="value">${booking.specialRequests}</td>
                    </tr>` : ''}
                    ${booking.totalPrice ? `
                    <tr class="total-row">
                        <td class="label">Estimated Total:</td>
                        <td class="value">PKR ${Number(booking.totalPrice).toLocaleString()}</td>
                    </tr>` : ''}
                </table>

                <div class="steps-box">
                    <h4>Next Steps to Guarantee Your Stay:</h4>
                    <ol>
                        <li>Our travel coordinator will call or message your phone <strong>(${booking.phone})</strong>.</li>
                        <li>We will verify property policies and lock your preferred room.</li>
                        <li>Your final confirmation voucher with check-in address will be sent to your email.</li>
                    </ol>
                </div>

                <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 20px;">
                    Have an urgent query? Contact our 24/7 Helpline at <strong style="color: #047857;">+92 300 1234567</strong>.
                </p>
            </div>

            <div class="footer">
                <p>&copy; 2026 Explore Galiyat Hotels &amp; Tourism Network. All rights reserved.</p>
                <p>Khaira Gali, Nathia Gali, Murree Road, Khyber Pakhtunkhwa, Pakistan</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const info = await mailer.sendMail({
            from: fromAddress,
            to: booking.email,
            subject: subject,
            html: htmlContent
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`📩 Stage 1 Customer Email sent for #${booking.id}! Preview: ${previewUrl}`);
        } else {
            console.log(`📩 Stage 1 Customer Email sent for #${booking.id} to ${booking.email}`);
        }

        logEmail('Stage 1 - Initial Acknowledgment (Customer)', booking.email, subject, previewUrl);
        return { success: true, messageId: info.messageId, previewUrl };
    } catch (err) {
        console.error('❌ Failed to send Stage 1 email to customer:', err);
        logEmail('Stage 1 - Initial Acknowledgment (Customer)', booking.email, subject, null, err);
        return { success: false, error: err.message };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. STAGE 1: ADMIN NOTIFICATION EMAIL (TO AGENCY TEAM)
// ─────────────────────────────────────────────────────────────────────────────
async function sendStage1AdminNotification(booking) {
    const mailer = await getTransporter();
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || 'anabiaxhaikh190@gmail.com';
    const fromAddress = process.env.EMAIL_FROM || `"Explore Galiyat System" <${process.env.SMTP_USER || 'system@exploregaliyat.com'}>`;
    const subject = `🔔 NEW BOOKING: ${booking.guestName} - ${booking.property} (#${booking.id})`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: sans-serif; background-color: #f1f5f9; padding: 20px; color: #0f172a; }
            .box { max-width: 580px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 24px; border: 2px solid #047857; }
            h2 { color: #047857; margin-top: 0; }
            .btn { display: inline-block; background: #047857; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 14px; }
        </style>
    </head>
    <body>
        <div class="box">
            <h2>🔔 New Booking Received (#${booking.id})</h2>
            <p>A new customer has submitted a booking request on the website.</p>
            <ul>
                <li><strong>Guest Name:</strong> ${booking.guestName}</li>
                <li><strong>Phone:</strong> ${booking.phone}</li>
                <li><strong>Email:</strong> ${booking.email || 'N/A'}</li>
                <li><strong>Property:</strong> ${booking.property}</li>
                <li><strong>Room Type:</strong> ${booking.roomType}</li>
                <li><strong>Date/Time:</strong> ${booking.datetime}</li>
                <li><strong>Total Price:</strong> PKR ${Number(booking.totalPrice || 0).toLocaleString()}</li>
                <li><strong>Special Requests:</strong> ${booking.specialRequests || 'None'}</li>
            </ul>
            <p><strong>Action Required:</strong> Please contact the hotel management to verify room availability, then open the Admin Dashboard to click <strong>"Confirm Booking"</strong>.</p>
            <a href="http://localhost:8080/admin.html" class="btn">Open Admin Dashboard</a>
        </div>
    </body>
    </html>
    `;

    try {
        const info = await mailer.sendMail({
            from: fromAddress,
            to: adminEmail,
            subject: subject,
            html: htmlContent
        });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        logEmail('Stage 1 - Admin Notification', adminEmail, subject, previewUrl);
        return { success: true, previewUrl };
    } catch (err) {
        console.error('Failed to send admin notification email:', err);
        return { success: false, error: err.message };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. STAGE 2: FINAL OFFICIAL BOOKING CONFIRMATION (ON ADMIN APPROVAL)
// ─────────────────────────────────────────────────────────────────────────────
async function sendStage2ConfirmationEmail(booking) {
    if (!booking.email) {
        console.log(`ℹ️ No customer email provided for booking #${booking.id}, skipping confirmation email.`);
        return null;
    }

    const mailer = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || `"Explore Galiyat Reservations" <${process.env.SMTP_USER || 'reservations@exploregaliyat.com'}>`;
    const subject = `✅ Booking CONFIRMED: ${booking.property} (#${booking.id}) - Official Stay Voucher`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #10b981; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.15); }
            .header { background: linear-gradient(135deg, #0f172a, #047857); padding: 28px 30px; text-align: center; border-bottom: 4px solid #10b981; }
            .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; }
            .header p { color: #a7f3d0; margin: 6px 0 0 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; }
            .content { padding: 32px 30px; }
            .voucher-badge { background: #dcfce7; color: #047857; font-weight: 800; font-size: 13px; padding: 6px 14px; border-radius: 20px; border: 1px solid #86efac; display: inline-flex; align-items: center; gap: 6px; }
            .hero-card { background: #f0fdf4; border: 1.5px solid #a7f3d0; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
            .hero-card h2 { color: #047857; margin: 0 0 6px 0; font-size: 22px; }
            .summary-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
            .summary-table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; }
            .summary-table td.label { font-weight: 600; color: #64748b; width: 38%; }
            .summary-table td.value { font-weight: 700; color: #0f172a; }
            .total-row td { background: #f0fdf4; font-size: 17px; font-weight: 800; color: #047857; border-top: 2px solid #a7f3d0; }
            .instructions-card { background: #f8fafc; border-radius: 8px; padding: 18px 20px; margin: 24px 0; border: 1px solid #e2e8f0; }
            .instructions-card h4 { margin: 0 0 10px 0; font-size: 15px; color: #0f172a; }
            .instructions-card ul { margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.6; }
            .btn-directions { display: inline-block; background: #047857; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 800; font-size: 14px; margin-top: 14px; }
            .footer { background: #0f172a; padding: 22px 30px; text-align: center; color: #94a3b8; font-size: 12px; }
            .footer a { color: #10b981; text-decoration: none; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Explore Galiyat</h1>
                <p>Official Reservation Voucher</p>
            </div>
            
            <div class="content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <span class="voucher-badge">✅ BOOKING CONFIRMED</span>
                    <span style="font-size: 14px; color: #0f172a; font-weight: 800;">Voucher #${booking.id}</span>
                </div>

                <div class="hero-card">
                    <h2>Your Stay is Officially Confirmed!</h2>
                    <p style="margin: 0; color: #065f46; font-size: 14px;">
                        Dear <strong>${booking.guestName}</strong>, we have finalized your reservation with the hotel management. Your room is reserved and waiting for you!
                    </p>
                </div>

                <h3 style="font-size: 16px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 24px 0 12px;">Stay &amp; Property Details</h3>
                <table class="summary-table">
                    <tr>
                        <td class="label">Property Name:</td>
                        <td class="value">${booking.property}</td>
                    </tr>
                    <tr>
                        <td class="label">Location / Address:</td>
                        <td class="value">Khaira Gali, Main Galiyat Road, Khyber Pakhtunkhwa, Pakistan</td>
                    </tr>
                    <tr>
                        <td class="label">Room / Unit:</td>
                        <td class="value">${booking.roomType || 'Deluxe Apartment / Villa'}</td>
                    </tr>
                    <tr>
                        <td class="label">Booking Date &amp; Time:</td>
                        <td class="value">${booking.datetime || 'As scheduled'}</td>
                    </tr>
                    <tr>
                        <td class="label">Check-in / Check-out:</td>
                        <td class="value">Check-in: 02:00 PM · Check-out: 12:00 PM</td>
                    </tr>
                    <tr>
                        <td class="label">Guests:</td>
                        <td class="value">${booking.guestsCount || '2 adults'}</td>
                    </tr>
                    <tr>
                        <td class="label">Guest Phone:</td>
                        <td class="value">${booking.phone}</td>
                    </tr>
                    ${booking.totalPrice ? `
                    <tr class="total-row">
                        <td class="label">Total Amount:</td>
                        <td class="value">PKR ${Number(booking.totalPrice).toLocaleString()} (Includes Taxes)</td>
                    </tr>` : ''}
                </table>

                <div class="instructions-card">
                    <h4>Important Check-in Instructions:</h4>
                    <ul>
                        <li><strong>Arrival:</strong> Show this email voucher or mention Booking Reference <strong>#${booking.id}</strong> at front desk.</li>
                        <li><strong>Identification:</strong> Please present valid CNIC / Passport at check-in.</li>
                        <li><strong>Complimentary Perks:</strong> Free private parking &amp; high-speed Wi-Fi included.</li>
                        <li><strong>Early Check-in / Late Check-out:</strong> Subject to availability; contact property in advance.</li>
                    </ul>
                    <div style="text-align: center;">
                        <a href="https://maps.google.com/?q=Khaira+Gali+Abbottabad+Khyber+Pakhtunkhwa" target="_blank" class="btn-directions">
                            📍 Open Property Location in Google Maps
                        </a>
                    </div>
                </div>

                <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 24px;">
                    Need assistance during your journey? Call our Concierge Helpdesk 24/7 at <strong style="color: #047857;">+92 300 1234567</strong>.
                </p>
            </div>

            <div class="footer">
                <p>&copy; 2026 Explore Galiyat &amp; ${booking.property}. All rights reserved.</p>
                <p>Khaira Gali, Galiyat, Khyber Pakhtunkhwa, Pakistan</p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const info = await mailer.sendMail({
            from: fromAddress,
            to: booking.email,
            subject: subject,
            html: htmlContent
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`🎉 Stage 2 Confirmation Email sent for #${booking.id}! Preview: ${previewUrl}`);
        } else {
            console.log(`🎉 Stage 2 Confirmation Email sent for #${booking.id} to ${booking.email}`);
        }

        logEmail('Stage 2 - Official Confirmation (Customer)', booking.email, subject, previewUrl);
        return { success: true, messageId: info.messageId, previewUrl };
    } catch (err) {
        console.error('❌ Failed to send Stage 2 confirmation email:', err);
        logEmail('Stage 2 - Official Confirmation (Customer)', booking.email, subject, null, err);
        return { success: false, error: err.message };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CANCELLATION EMAIL (IF ROOM NOT AVAILABLE)
// ─────────────────────────────────────────────────────────────────────────────
async function sendCancellationEmail(booking, reason = 'Selected dates are fully booked by property') {
    if (!booking.email) return null;

    const mailer = await getTransporter();
    const fromAddress = process.env.EMAIL_FROM || `"Explore Galiyat Reservations" <${process.env.SMTP_USER || 'reservations@exploregaliyat.com'}>`;
    const subject = `Booking Update: ${booking.property} (#${booking.id}) - Explore Galiyat`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; background-color: #f1f5f9; padding: 20px; color: #1e293b;">
        <div style="max-width: 580px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 24px; border-left: 4px solid #ef4444;">
            <h2 style="color: #ef4444; margin-top: 0;">Reservation Update for #${booking.id}</h2>
            <p>Dear <strong>${booking.guestName}</strong>,</p>
            <p>We regret to inform you that we could not secure confirmation for your requested stay at <strong>${booking.property}</strong> for the chosen dates.</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p>Our team would love to help you find alternative available luxury stays in Galiyat (e.g. Crown Inn or Maria Villa alternate dates). Please reply to this email or call us at <strong>+92 300 1234567</strong>.</p>
            <p>Warm regards,<br>Explore Galiyat Reservations Team</p>
        </div>
    </body>
    </html>
    `;

    try {
        const info = await mailer.sendMail({
            from: fromAddress,
            to: booking.email,
            subject: subject,
            html: htmlContent
        });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        logEmail('Cancellation Notice (Customer)', booking.email, subject, previewUrl);
        return { success: true, previewUrl };
    } catch (err) {
        console.error('Failed to send cancellation email:', err);
        return { success: false, error: err.message };
    }
}

module.exports = {
    sendStage1InitialEmail,
    sendStage1AdminNotification,
    sendStage2ConfirmationEmail,
    sendCancellationEmail,
    getEmailLogs() { return emailLogs; }
};
