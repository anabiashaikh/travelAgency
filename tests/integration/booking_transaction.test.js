const { test, describe } = require('node:test');
const assert = require('node:assert');
const { generateBookingReference } = require('../../src/modules/bookings/booking.repository');

describe('Booking System Mechanics', () => {

    test('generateBookingReference produces standard GB-XXXXXX format', () => {
        const ref1 = generateBookingReference();
        const ref2 = generateBookingReference();

        assert.ok(ref1.startsWith('GB-'));
        assert.strictEqual(ref1.length, 9); // 'GB-' + 6 chars
        assert.notStrictEqual(ref1, ref2);
    });

    test('Booking status state machine rules', () => {
        const allowedTransitions = {
            'Pending': ['Confirmed', 'Cancelled'],
            'Confirmed': ['Cancelled', 'Completed'],
            'Cancelled': ['Pending'],
            'Completed': []
        };

        // Allowed transitions
        assert.ok(allowedTransitions['Pending'].includes('Confirmed'));
        assert.ok(allowedTransitions['Pending'].includes('Cancelled'));
        assert.ok(allowedTransitions['Confirmed'].includes('Cancelled'));

        // Disallowed transitions
        assert.ok(!allowedTransitions['Completed'].includes('Pending'));
        assert.ok(!allowedTransitions['Completed'].includes('Confirmed'));
    });
});
