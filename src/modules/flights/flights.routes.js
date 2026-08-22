const express = require('express');
const router = express.Router();
const BookingService = require('../bookings/booking.service');
const { bookingLimiter } = require('../../middleware/rateLimiter');

// Flight Provider Abstraction Interface
const FlightProvider = {
    async submitInquiry(flightData, idempotencyKey) {
        const payload = {
            firstName: flightData.firstName || flightData.passengerName?.split(' ')[0] || 'Passenger',
            lastName: flightData.lastName || flightData.passengerName?.split(' ').slice(1).join(' ') || '',
            guestName: flightData.passengerName || `${flightData.firstName || ''} ${flightData.lastName || ''}`.trim() || 'Valued Passenger',
            phone: flightData.phone || '',
            email: flightData.email || '',
            property: `Flight: ${flightData.airline || 'Domestic'} (${flightData.route || flightData.from + ' to ' + flightData.to || 'Islamabad Flight'})`,
            bookingType: 'Flight Inquiry',
            roomType: flightData.class || 'Economy Class',
            roomsCount: parseInt(flightData.passengers, 10) || 1,
            datetime: flightData.departDate || new Date().toLocaleDateString(),
            totalPrice: Number(flightData.totalPrice) || 38500,
            specialRequests: flightData.specialRequests || `Flight: ${flightData.flightNumber || 'Scheduled'}, Route: ${flightData.from || 'ISB'} to ${flightData.to || 'KHI'}`,
            confirmationChannel: 'Email'
        };

        return await BookingService.createBooking(payload, idempotencyKey);
    }
};

// POST /api/flights/inquiry - Submit flight booking inquiry
router.post('/inquiry', bookingLimiter, async (req, res, next) => {
    try {
        const idempotencyKey = req.headers['idempotency-key'] || null;
        const result = await FlightProvider.submitInquiry(req.body, idempotencyKey);

        return res.status(result.isDuplicate ? 200 : 201).json({
            success: true,
            message: 'Flight reservation inquiry received successfully! Our ticketing team will contact you with e-ticket confirmation.',
            data: result.data
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
