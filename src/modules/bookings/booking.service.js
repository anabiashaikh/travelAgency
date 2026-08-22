const BookingRepository = require('./booking.repository');
const { validateBookingPayload } = require('./booking.validation');

const BookingService = {
    async createBooking(payload, idempotencyKey = null) {
        // 1. Server-side validation
        const validation = validateBookingPayload(payload);
        if (!validation.isValid) {
            const err = new Error(validation.errors.join(' '));
            err.statusCode = 400;
            err.code = 'VALIDATION_FAILED';
            err.details = validation.errors;
            throw err;
        }

        // 2. Create booking via ACID transaction
        const result = await BookingRepository.createBookingTransactional(validation.data, idempotencyKey);
        return result;
    },

    async getBookingById(id) {
        const booking = await BookingRepository.getBookingById(id);
        if (!booking) {
            const err = new Error(`Booking #${id} not found.`);
            err.statusCode = 404;
            err.code = 'BOOKING_NOT_FOUND';
            throw err;
        }
        return booking;
    },

    async updateBookingStatus(id, newStatus, adminUser, reason = '') {
        if (!newStatus) {
            const err = new Error('Status is required.');
            err.statusCode = 400;
            err.code = 'MISSING_STATUS';
            throw err;
        }
        return await BookingRepository.updateBookingStatus(
            id,
            newStatus,
            adminUser?.id,
            adminUser?.email,
            reason
        );
    },

    async resendConfirmation(id, adminUser) {
        return await BookingRepository.resendConfirmationEmail(
            id,
            adminUser?.id,
            adminUser?.email
        );
    },

    async softDeleteBooking(id, adminUser) {
        const success = await BookingRepository.softDeleteBooking(
            id,
            adminUser?.id,
            adminUser?.email
        );
        if (!success) {
            const err = new Error(`Booking #${id} not found or already deleted.`);
            err.statusCode = 404;
            err.code = 'BOOKING_NOT_FOUND';
            throw err;
        }
        return true;
    },

    async getPaginatedBookings(query) {
        return await BookingRepository.getPaginatedBookings(query);
    },

    async getMetrics() {
        return await BookingRepository.getDashboardMetrics();
    }
};

module.exports = BookingService;
