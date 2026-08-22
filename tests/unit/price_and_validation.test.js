const { test, describe } = require('node:test');
const assert = require('node:assert');
const { validateBookingPayload, isValidEmail, isValidPhone, sanitizeString } = require('../../src/modules/bookings/booking.validation');
const EmailTemplates = require('../../src/modules/emails/email.templates');

describe('Booking Payload Validation & Sanitization', () => {

    test('Valid booking payload should pass validation', () => {
        const payload = {
            firstName: 'Ahmed',
            lastName: 'Khan',
            email: 'ahmed.khan@example.com',
            phone: '+923001234567',
            city: 'Islamabad',
            country: 'Pakistan',
            property: 'Maria Villa Retreat',
            roomsCount: 2,
            checkInDate: '2026-09-01',
            checkOutDate: '2026-09-05',
            totalPrice: 36000
        };

        const result = validateBookingPayload(payload);
        assert.strictEqual(result.isValid, true);
        assert.strictEqual(result.errors.length, 0);
        assert.strictEqual(result.data.guestName, 'Ahmed Khan');
        assert.strictEqual(result.data.roomsCount, 2);
        assert.strictEqual(result.data.totalPrice, 36000);
    });

    test('Missing email should fail validation', () => {
        const payload = {
            firstName: 'Sarah',
            phone: '03123456789'
        };

        const result = validateBookingPayload(payload);
        assert.strictEqual(result.isValid, false);
        assert.ok(result.errors.some(e => e.includes('Email')));
    });

    test('Malformed email address should be rejected', () => {
        assert.strictEqual(isValidEmail('not-an-email'), false);
        assert.strictEqual(isValidEmail('test@'), false);
        assert.strictEqual(isValidEmail('@domain.com'), false);
        assert.strictEqual(isValidEmail('valid.user@gmail.com'), true);
    });

    test('Short phone numbers should be rejected', () => {
        assert.strictEqual(isValidPhone('123'), false);
        assert.strictEqual(isValidPhone('+92 300 1234567'), true);
    });

    test('Check-out date before check-in date must fail', () => {
        const payload = {
            firstName: 'Bilal',
            email: 'bilal@example.com',
            phone: '03001234567',
            checkInDate: '2026-09-10',
            checkOutDate: '2026-09-05'
        };

        const result = validateBookingPayload(payload);
        assert.strictEqual(result.isValid, false);
        assert.ok(result.errors.some(e => e.includes('Check-out date must be strictly after check-in date')));
    });

    test('Email templates must escape dangerous HTML injection', () => {
        const dangerousBooking = {
            guestName: '<script>alert("xss")</script>',
            id: 'GB-1234"><img src=x onerror=alert(1)>',
            property: '<b>Pine Villa</b>',
            roomType: '<iframe src="evil.com"></iframe>',
            totalPrice: 15000
        };

        const html = EmailTemplates.getStage1CustomerEmail(dangerousBooking);
        assert.ok(!html.includes('<script>'));
        assert.ok(!html.includes('<iframe'));
        assert.ok(html.includes('&lt;script&gt;'));
        assert.ok(html.includes('&lt;iframe'));
    });
});
