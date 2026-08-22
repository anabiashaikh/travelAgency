const BookingService = require('../bookings/booking.service');
const { query, transaction } = require('../../config/database');
const logger = require('../../config/logger');

const AdminController = {
    async getMetrics(req, res, next) {
        try {
            const metrics = await BookingService.getMetrics();
            return res.json({
                success: true,
                data: metrics
            });
        } catch (err) {
            next(err);
        }
    },

    async getBookings(req, res, next) {
        try {
            const { page, limit, search, status, property, dateFrom, dateTo } = req.query;
            const result = await BookingService.getPaginatedBookings({
                page,
                limit,
                search,
                status,
                property,
                dateFrom,
                dateTo
            });

            return res.json({
                success: true,
                data: result.bookings,
                pagination: result.pagination
            });
        } catch (err) {
            next(err);
        }
    },

    async getBookingById(req, res, next) {
        try {
            const booking = await BookingService.getBookingById(req.params.id);
            return res.json({
                success: true,
                data: booking
            });
        } catch (err) {
            next(err);
        }
    },

    async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;
            const updated = await BookingService.updateBookingStatus(id, status, req.user, reason);

            logger.info(`Admin ${req.user.email} updated booking #${id} status to [${status}]`, {
                adminId: req.user.id,
                bookingId: id,
                status
            });

            return res.json({
                success: true,
                message: `Booking #${id} status updated to ${status}.`,
                data: updated
            });
        } catch (err) {
            next(err);
        }
    },

    async resendConfirmation(req, res, next) {
        try {
            const { id } = req.params;
            const booking = await BookingService.resendConfirmation(id, req.user);

            logger.info(`Admin ${req.user.email} resent confirmation email for #${id}`, {
                adminId: req.user.id,
                bookingId: id
            });

            return res.json({
                success: true,
                message: `Official confirmation voucher has been scheduled for dispatch to ${booking.email}.`,
                data: booking
            });
        } catch (err) {
            next(err);
        }
    },

    async deleteBooking(req, res, next) {
        try {
            const { id } = req.params;
            await BookingService.softDeleteBooking(id, req.user);

            logger.warn(`Admin ${req.user.email} soft-deleted booking #${id}`, {
                adminId: req.user.id,
                bookingId: id
            });

            return res.json({
                success: true,
                message: `Booking #${id} successfully moved to trash.`
            });
        } catch (err) {
            next(err);
        }
    },

    async getEmailLogs(req, res, next) {
        try {
            const resLogs = await query(
                'SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 100;'
            );
            return res.json({
                success: true,
                count: resLogs.rows.length,
                data: resLogs.rows
            });
        } catch (err) {
            next(err);
        }
    },

    async getAuditLogs(req, res, next) {
        try {
            const resLogs = await query(
                'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100;'
            );
            return res.json({
                success: true,
                count: resLogs.rows.length,
                data: resLogs.rows
            });
        } catch (err) {
            next(err);
        }
    },

    async addProperty(req, res, next) {
        try {
            const { name, location, price, stars, type, img, room } = req.body;
            if (!name || !location) {
                const err = new Error('Property name and location are required.');
                err.statusCode = 400;
                err.code = 'INVALID_PROPERTY_DATA';
                throw err;
            }

            const propertyId = `prop_${Date.now().toString(36)}`;
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const startingPrice = Number(price) || 12000;
            const starRating = parseInt(stars, 10) || 4;

            await transaction(async (client) => {
                await client.query(`
                    INSERT INTO properties (id, name, slug, property_type, location_name, address, star_rating, starting_price, hero_image, is_active)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true);
                `, [propertyId, name, slug, type || 'hotel', location, location, starRating, startingPrice, img || 'assets/598913780.jpg']);

                const roomTypeId = `room_${Date.now().toString(36)}`;
                await client.query(`
                    INSERT INTO room_types (id, property_id, name, base_price, total_rooms)
                    VALUES ($1, $2, $3, $4, 5);
                `, [roomTypeId, propertyId, room || 'Standard Room', startingPrice]);

                await client.query(`
                    INSERT INTO audit_logs (admin_id, admin_email, action, entity_type, entity_id, new_values, created_at)
                    VALUES ($1, $2, 'ADD_HOTEL', 'property', $3, $4, NOW());
                `, [req.user.id, req.user.email, propertyId, JSON.stringify({ name, location, startingPrice })]);
            });

            logger.info(`Admin ${req.user.email} created new property: ${name} (${propertyId})`);

            return res.status(201).json({
                success: true,
                message: `Property "${name}" created successfully.`,
                data: {
                    id: propertyId,
                    name,
                    slug,
                    location,
                    price: startingPrice
                }
            });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = AdminController;
