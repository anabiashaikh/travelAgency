const BookingService = require('./booking.service');
const logger = require('../../config/logger');

const BookingController = {
    async createBooking(req, res, next) {
        try {
            const idempotencyKey = req.headers['idempotency-key'] || null;
            const result = await BookingService.createBooking(req.body, idempotencyKey);

            const booking = result.data;
            logger.info(`New Booking #${booking.id} created for ${booking.guestName} (${booking.property})`, {
                bookingId: booking.id,
                isDuplicate: result.isDuplicate,
                ip: req.ip
            });

            return res.status(result.isDuplicate ? 200 : 201).json({
                success: true,
                message: result.isDuplicate 
                    ? 'Existing booking retrieved (Idempotent request).'
                    : 'Booking request received successfully! An acknowledgment email has been scheduled.',
                data: booking
            });
        } catch (err) {
            next(err);
        }
    },

    async getPublicBookingStatus(req, res, next) {
        try {
            const booking = await BookingService.getBookingById(req.params.id);
            // Return public safe view
            return res.json({
                success: true,
                data: {
                    id: booking.id,
                    guestName: booking.guestName,
                    property: booking.property,
                    roomType: booking.roomType,
                    datetime: booking.datetime,
                    status: booking.status,
                    createdAt: booking.createdAt
                }
            });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = BookingController;
