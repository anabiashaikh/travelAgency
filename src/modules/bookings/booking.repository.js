const crypto = require('crypto');
const { pool, transaction, query } = require('../../config/database');
const EmailService = require('../emails/email.service');
const env = require('../../config/env');
const logger = require('../../config/logger');

function generateBookingReference() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
        code += chars[bytes[i] % chars.length];
    }
    return `GB-${code}`;
}

function mapRowToBooking(row) {
    if (!row) return null;
    return {
        id: row.id,
        uuidId: row.uuid_id,
        guestName: row.guest_name,
        firstName: row.first_name || '',
        lastName: row.last_name || '',
        phone: row.phone || '',
        email: row.email || '',
        street: row.street || '',
        street2: row.street2 || '',
        city: row.city || '',
        state: row.state || '',
        postal: row.postal || '',
        country: row.country || 'Pakistan',
        propertyId: row.property_id,
        property: row.property || 'Explore Galiyat Stay & Tour',
        roomTypeId: row.room_type_id,
        roomType: row.room_type || 'Standard Room',
        roomsCount: parseInt(row.rooms_count, 10) || 1,
        guestsCount: row.guests_count || '2 adults · 0 children',
        checkInDate: row.check_in_date ? row.check_in_date.toISOString().split('T')[0] : null,
        checkOutDate: row.check_out_date ? row.check_out_date.toISOString().split('T')[0] : null,
        datetime: row.datetime || '',
        bookingType: row.booking_type || 'Reservation',
        confirmationChannel: row.confirmation_channel || 'Email',
        specialRequests: row.special_requests || '',
        comments: row.comments || '',
        currency: row.currency || 'PKR',
        subtotal: parseFloat(row.subtotal) || 0,
        tax: parseFloat(row.tax) || 0,
        discount: parseFloat(row.discount) || 0,
        totalPrice: parseFloat(row.total_price) || 0,
        status: row.status || 'Pending',
        confirmedAt: row.confirmed_at ? new Date(row.confirmed_at).toISOString() : null,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
    };
}

const BookingRepository = {
    mapRowToBooking,
    generateBookingReference,

    /**
     * Create a booking with ACID transaction and idempotency support
     */
    async createBookingTransactional(bookingData, idempotencyKey = null) {
        // 1. Check Idempotency Key
        if (idempotencyKey) {
            const existingKeyRes = await query(
                'SELECT response_payload FROM idempotency_keys WHERE key = $1 LIMIT 1;',
                [idempotencyKey]
            );
            if (existingKeyRes.rows.length > 0) {
                logger.info(`Idempotency key hit for key: ${idempotencyKey}. Returning cached response.`);
                return {
                    isDuplicate: true,
                    data: existingKeyRes.rows[0].response_payload
                };
            }
        }

        return await transaction(async (client) => {
            const referenceId = generateBookingReference();
            const uuidId = crypto.randomUUID();

            const insertQuery = `
                INSERT INTO bookings (
                    id, uuid_id, guest_name, first_name, last_name, phone, email,
                    street, street2, city, state, postal, country,
                    property_id, property, room_type_id, room_type,
                    rooms_count, guests_count, check_in_date, check_out_date,
                    datetime, booking_type, confirmation_channel,
                    special_requests, comments, currency, subtotal,
                    tax, discount, total_price, status, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7,
                    $8, $9, $10, $11, $12, $13,
                    $14, $15, $16, $17,
                    $18, $19, $20, $21,
                    $22, $23, $24,
                    $25, $26, $27, $28,
                    $29, $30, $31, 'Pending', NOW(), NOW()
                ) RETURNING *;
            `;

            const params = [
                referenceId,
                uuidId,
                bookingData.guestName,
                bookingData.firstName,
                bookingData.lastName,
                bookingData.phone,
                bookingData.email,
                bookingData.street,
                bookingData.street2,
                bookingData.city,
                bookingData.state,
                bookingData.postal,
                bookingData.country,
                bookingData.propertyId,
                bookingData.property,
                bookingData.roomTypeId,
                bookingData.roomType,
                bookingData.roomsCount,
                bookingData.guestsCount,
                bookingData.checkInDate,
                bookingData.checkOutDate,
                bookingData.datetime,
                bookingData.bookingType,
                bookingData.confirmationChannel,
                bookingData.specialRequests,
                bookingData.comments,
                'PKR',
                bookingData.totalPrice,
                0,
                0,
                bookingData.totalPrice
            ];

            const insertRes = await client.query(insertQuery, params);
            const createdBooking = mapRowToBooking(insertRes.rows[0]);

            // Enqueue Stage 1 Customer Acknowledgment Email Job
            if (createdBooking.email) {
                await EmailService.enqueueEmailJob(client, {
                    bookingId: createdBooking.id,
                    type: 'STAGE1_CUSTOMER_ACKNOWLEDGMENT',
                    recipientEmail: createdBooking.email,
                    subject: `Booking Request Received: ${createdBooking.property} (#${createdBooking.id}) - Explore Galiyat`,
                    payload: createdBooking
                });
            }

            // Enqueue Stage 1 Admin Notification Alert
            if (env.ADMIN_NOTIFICATION_EMAIL) {
                await EmailService.enqueueEmailJob(client, {
                    bookingId: createdBooking.id,
                    type: 'STAGE1_ADMIN_ALERT',
                    recipientEmail: env.ADMIN_NOTIFICATION_EMAIL,
                    subject: `🔔 New Booking Alert: #${createdBooking.id} (${createdBooking.guestName} - ${createdBooking.property})`,
                    payload: createdBooking
                });
            }

            // Save Idempotency Key
            if (idempotencyKey) {
                await client.query(`
                    INSERT INTO idempotency_keys (key, booking_id, response_payload, created_at)
                    VALUES ($1, $2, $3, NOW())
                    ON CONFLICT (key) DO NOTHING;
                `, [idempotencyKey, createdBooking.id, JSON.stringify(createdBooking)]);
            }

            return {
                isDuplicate: false,
                data: createdBooking
            };
        });
    },

    /**
     * Get single booking by ID or UUID
     */
    async getBookingById(id) {
        const cleanId = id.startsWith('#') ? id.substring(1) : id;
        const res = await query(`
            SELECT * FROM bookings 
            WHERE (id = $1 OR uuid_id = $1) AND deleted_at IS NULL
            LIMIT 1;
        `, [cleanId]);

        return mapRowToBooking(res.rows[0]);
    },

    /**
     * Update booking status with state machine and audit logging
     */
    async updateBookingStatus(id, newStatus, adminId = null, adminEmail = 'admin', reason = '') {
        const cleanId = id.startsWith('#') ? id.substring(1) : id;

        return await transaction(async (client) => {
            const currentRes = await client.query(`
                SELECT * FROM bookings 
                WHERE id = $1 AND deleted_at IS NULL 
                FOR UPDATE;
            `, [cleanId]);

            if (currentRes.rows.length === 0) {
                const err = new Error(`Booking #${id} not found.`);
                err.statusCode = 404;
                err.code = 'BOOKING_NOT_FOUND';
                throw err;
            }

            const currentBooking = mapRowToBooking(currentRes.rows[0]);
            const oldStatus = currentBooking.status;

            // Valid status transitions
            const allowedTransitions = {
                'Pending': ['Confirmed', 'Cancelled'],
                'Confirmed': ['Cancelled', 'Completed'],
                'Cancelled': ['Pending'],
                'Completed': []
            };

            if (allowedTransitions[oldStatus] && !allowedTransitions[oldStatus].includes(newStatus) && oldStatus !== newStatus) {
                const err = new Error(`Invalid status transition from '${oldStatus}' to '${newStatus}'.`);
                err.statusCode = 400;
                err.code = 'INVALID_STATUS_TRANSITION';
                throw err;
            }

            let updateQuery = `
                UPDATE bookings 
                SET status = $1, updated_at = NOW() 
                WHERE id = $2 
                RETURNING *;
            `;
            let params = [newStatus, cleanId];

            if (newStatus === 'Confirmed') {
                updateQuery = `
                    UPDATE bookings 
                    SET status = $1, confirmed_at = NOW(), updated_at = NOW() 
                    WHERE id = $2 
                    RETURNING *;
                `;
            }

            const updateRes = await client.query(updateQuery, params);
            const updatedBooking = mapRowToBooking(updateRes.rows[0]);

            // Write Audit Log
            await client.query(`
                INSERT INTO audit_logs (admin_id, admin_email, action, entity_type, entity_id, old_values, new_values, created_at)
                VALUES ($1, $2, 'BOOKING_STATUS_CHANGE', 'booking', $3, $4, $5, NOW());
            `, [
                adminId,
                adminEmail,
                cleanId,
                JSON.stringify({ status: oldStatus }),
                JSON.stringify({ status: newStatus, reason })
            ]);

            // Trigger Stage 2 Confirmation Email
            if (newStatus === 'Confirmed' && updatedBooking.email) {
                await EmailService.enqueueEmailJob(client, {
                    bookingId: updatedBooking.id,
                    type: 'STAGE2_CONFIRMATION_VOUCHER',
                    recipientEmail: updatedBooking.email,
                    subject: `Official Booking Confirmation Voucher: ${updatedBooking.property} (#${updatedBooking.id}) - Explore Galiyat`,
                    payload: updatedBooking
                });
            } else if (newStatus === 'Cancelled' && updatedBooking.email) {
                await EmailService.enqueueEmailJob(client, {
                    bookingId: updatedBooking.id,
                    type: 'CANCELLATION_NOTICE',
                    recipientEmail: updatedBooking.email,
                    subject: `Reservation Cancelled: ${updatedBooking.property} (#${updatedBooking.id})`,
                    payload: { ...updatedBooking, reason }
                });
            }

            return updatedBooking;
        });
    },

    /**
     * Resend official confirmation voucher
     */
    async resendConfirmationEmail(id, adminId = null, adminEmail = 'admin') {
        const cleanId = id.startsWith('#') ? id.substring(1) : id;

        return await transaction(async (client) => {
            const currentRes = await client.query(`
                SELECT * FROM bookings 
                WHERE id = $1 AND deleted_at IS NULL 
                LIMIT 1;
            `, [cleanId]);

            if (currentRes.rows.length === 0) {
                const err = new Error(`Booking #${id} not found.`);
                err.statusCode = 404;
                err.code = 'BOOKING_NOT_FOUND';
                throw err;
            }

            const booking = mapRowToBooking(currentRes.rows[0]);
            if (!booking.email) {
                const err = new Error('No email address registered for this booking.');
                err.statusCode = 400;
                err.code = 'MISSING_EMAIL';
                throw err;
            }

            await EmailService.enqueueEmailJob(client, {
                bookingId: booking.id,
                type: 'STAGE2_CONFIRMATION_VOUCHER',
                recipientEmail: booking.email,
                subject: `[Resent] Official Booking Confirmation Voucher: ${booking.property} (#${booking.id}) - Explore Galiyat`,
                payload: booking
            });

            await client.query(`
                INSERT INTO audit_logs (admin_id, admin_email, action, entity_type, entity_id, created_at)
                VALUES ($1, $2, 'RESEND_CONFIRMATION', 'booking', $3, NOW());
            `, [adminId, adminEmail, cleanId]);

            return booking;
        });
    },

    /**
     * Soft delete booking
     */
    async softDeleteBooking(id, adminId = null, adminEmail = 'admin') {
        const cleanId = id.startsWith('#') ? id.substring(1) : id;

        return await transaction(async (client) => {
            const res = await client.query(`
                UPDATE bookings 
                SET deleted_at = NOW(), deleted_by = $1, updated_at = NOW() 
                WHERE id = $2 AND deleted_at IS NULL 
                RETURNING id;
            `, [adminId, cleanId]);

            if (res.rows.length === 0) return false;

            await client.query(`
                INSERT INTO audit_logs (admin_id, admin_email, action, entity_type, entity_id, created_at)
                VALUES ($1, $2, 'SOFT_DELETE_BOOKING', 'booking', $3, NOW());
            `, [adminId, adminEmail, cleanId]);

            return true;
        });
    },

    /**
     * Server-side paginated bookings search
     */
    async getPaginatedBookings({ page = 1, limit = 10, search = '', status = '', property = '', dateFrom = '', dateTo = '' }) {
        const safePage = Math.max(1, parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (safePage - 1) * safeLimit;

        const whereClauses = ['deleted_at IS NULL'];
        const values = [];

        if (search) {
            values.push(`%${search.trim().toLowerCase()}%`);
            whereClauses.push(`(
                LOWER(id) LIKE $${values.length} OR 
                LOWER(guest_name) LIKE $${values.length} OR 
                LOWER(email) LIKE $${values.length} OR 
                phone LIKE $${values.length} OR 
                LOWER(city) LIKE $${values.length} OR
                LOWER(property) LIKE $${values.length}
            )`);
        }

        if (status) {
            values.push(status);
            whereClauses.push(`status = $${values.length}`);
        }

        if (property) {
            values.push(`%${property.trim().toLowerCase()}%`);
            whereClauses.push(`LOWER(property) LIKE $${values.length}`);
        }

        if (dateFrom) {
            values.push(dateFrom);
            whereClauses.push(`created_at >= $${values.length}::TIMESTAMPTZ`);
        }

        if (dateTo) {
            values.push(dateTo);
            whereClauses.push(`created_at <= ($${values.length}::DATE + INTERVAL '1 day')`);
        }

        const whereSQL = whereClauses.join(' AND ');

        // 1. Total count
        const countRes = await query(`SELECT COUNT(*) AS total FROM bookings WHERE ${whereSQL};`, values);
        const total = parseInt(countRes.rows[0].total, 10) || 0;
        const totalPages = Math.ceil(total / safeLimit);

        // 2. Data page
        values.push(safeLimit, offset);
        const dataSQL = `
            SELECT * FROM bookings 
            WHERE ${whereSQL} 
            ORDER BY created_at DESC 
            LIMIT $${values.length - 1} OFFSET $${values.length};
        `;
        const dataRes = await query(dataSQL, values);

        return {
            bookings: dataRes.rows.map(mapRowToBooking),
            pagination: {
                page: safePage,
                limit: safeLimit,
                total,
                totalPages
            }
        };
    },

    /**
     * Instant aggregated dashboard KPIs
     */
    async getDashboardMetrics() {
        const sql = `
            SELECT 
                COUNT(*) AS total_bookings,
                COUNT(*) FILTER (WHERE status = 'Pending') AS pending_count,
                COUNT(*) FILTER (WHERE status = 'Confirmed') AS confirmed_count,
                COUNT(*) FILTER (WHERE status = 'Cancelled') AS cancelled_count,
                COALESCE(SUM(total_price) FILTER (WHERE status = 'Confirmed'), 0) AS total_revenue,
                COUNT(DISTINCT property) AS active_properties
            FROM bookings
            WHERE deleted_at IS NULL;
        `;
        const res = await query(sql);
        const row = res.rows[0];

        return {
            totalBookings: parseInt(row.total_bookings, 10) || 0,
            pendingCount: parseInt(row.pending_count, 10) || 0,
            confirmedCount: parseInt(row.confirmed_count, 10) || 0,
            cancelledCount: parseInt(row.cancelled_count, 10) || 0,
            totalRevenue: parseFloat(row.total_revenue) || 0,
            activeProperties: parseInt(row.active_properties, 10) || 0
        };
    }
};

module.exports = BookingRepository;
