const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err);
});

// Helper to convert snake_case DB row to camelCase JS object
function mapRowToBooking(row) {
    if (!row) return null;
    return {
        id: row.id,
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
        property: row.property || 'Galiyat Stay',
        bookingType: row.booking_type || 'Reservation',
        roomType: row.room_type || 'Standard Room',
        roomsCount: parseInt(row.rooms_count) || 1,
        guestsCount: row.guests_count || '2 adults · 0 children',
        datetime: row.datetime || '',
        checkInDate: row.check_in_date || '',
        checkOutDate: row.check_out_date || '',
        totalPrice: parseFloat(row.total_price) || 0,
        specialRequests: row.special_requests || '',
        confirmationChannel: row.confirmation_channel || 'Email',
        comments: row.comments || '',
        status: row.status || 'Pending',
        confirmedAt: row.confirmed_at ? new Date(row.confirmed_at).toISOString() : null,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
    };
}

function mapRowToEmailLog(row) {
    if (!row) return null;
    return {
        id: row.log_id || row.id.toString(),
        type: row.type,
        to: row.to_email,
        subject: row.subject,
        previewUrl: row.preview_url,
        status: row.status,
        error: row.error,
        sentAt: row.sent_at ? new Date(row.sent_at).toISOString() : new Date().toISOString()
    };
}

function generateBookingId() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `GB-${randomNum}`;
}

// Database Initialization & Table Setup
async function initDb() {
    try {
        console.log('🐘 Initializing PostgreSQL tables...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id VARCHAR(50) PRIMARY KEY,
                guest_name VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                phone VARCHAR(50),
                email VARCHAR(255),
                street TEXT,
                street2 TEXT,
                city VARCHAR(100),
                state VARCHAR(100),
                postal VARCHAR(50),
                country VARCHAR(100) DEFAULT 'Pakistan',
                property VARCHAR(255),
                booking_type VARCHAR(100) DEFAULT 'Reservation',
                room_type VARCHAR(255) DEFAULT 'Standard Room',
                rooms_count INT DEFAULT 1,
                guests_count VARCHAR(100) DEFAULT '2 adults · 0 children',
                datetime VARCHAR(100),
                check_in_date VARCHAR(100),
                check_out_date VARCHAR(100),
                total_price NUMERIC DEFAULT 0,
                special_requests TEXT,
                confirmation_channel VARCHAR(50) DEFAULT 'Email',
                comments TEXT,
                status VARCHAR(50) DEFAULT 'Pending',
                confirmed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS email_logs (
                id SERIAL PRIMARY KEY,
                log_id VARCHAR(50),
                type VARCHAR(100),
                to_email VARCHAR(255),
                subject VARCHAR(255),
                preview_url TEXT,
                status VARCHAR(50) DEFAULT 'Sent',
                error TEXT,
                sent_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        console.log('✔ PostgreSQL tables ready.');

        // Migrate local JSON bookings if any exist
        await migrateLocalJsonData();
    } catch (err) {
        console.error('❌ Error during PostgreSQL table initialization:', err);
    }
}

// Automatic Migration of data/bookings.json to PostgreSQL
async function migrateLocalJsonData() {
    try {
        const jsonPath = path.join(__dirname, '..', '..', 'data', 'bookings.json');
        if (fs.existsSync(jsonPath)) {
            const raw = fs.readFileSync(jsonPath, 'utf8');
            const bookings = JSON.parse(raw || '[]');
            if (bookings.length > 0) {
                console.log(`📦 Found ${bookings.length} local booking records to synchronize with PostgreSQL...`);
                for (const b of bookings) {
                    const id = b.id || generateBookingId();
                    const guestName = b.guestName || `${b.firstName || ''} ${b.lastName || ''}`.trim() || 'Valued Guest';
                    const createdAt = b.createdAt ? new Date(b.createdAt) : new Date();

                    await pool.query(`
                        INSERT INTO bookings (
                            id, guest_name, first_name, last_name, phone, email, street, street2,
                            city, state, postal, country, property, booking_type, room_type,
                            rooms_count, guests_count, datetime, check_in_date, check_out_date,
                            total_price, special_requests, confirmation_channel, comments,
                            status, created_at, updated_at
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8,
                            $9, $10, $11, $12, $13, $14, $15,
                            $16, $17, $18, $19, $20,
                            $21, $22, $23, $24,
                            $25, $26, $27
                        ) ON CONFLICT (id) DO NOTHING;
                    `, [
                        id, guestName, b.firstName || '', b.lastName || '', b.phone || '', b.email || '',
                        b.street || '', b.street2 || '', b.city || '', b.state || '', b.postal || '',
                        b.country || 'Pakistan', b.property || 'Galiyat Stay', b.bookingType || 'Reservation',
                        b.roomType || 'Standard Room', b.roomsCount || 1, b.guestsCount || '2 adults · 0 children',
                        b.datetime || '', b.checkInDate || '', b.checkOutDate || '', Number(b.totalPrice) || 0,
                        b.specialRequests || '', b.confirmationChannel || 'Email', b.comments || '',
                        b.status || 'Pending', createdAt, createdAt
                    ]);
                }
                console.log('✔ JSON data successfully migrated to PostgreSQL!');
            }
        }
    } catch (err) {
        console.warn('Notice: Local JSON migration skipped or failed:', err.message);
    }
}

// Run DB table initialization on module load
initDb();

const Database = {
    pool,

    // 1. Get all bookings
    async getAllBookings() {
        try {
            const res = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC;');
            return res.rows.map(mapRowToBooking);
        } catch (err) {
            console.error('Error in getAllBookings:', err);
            throw err;
        }
    },

    // 2. Get booking by ID
    async getBookingById(id) {
        try {
            const cleanId = id.startsWith('#') ? id.substring(1) : id;
            const res = await pool.query('SELECT * FROM bookings WHERE id = $1 OR id = $2;', [cleanId, `#${cleanId}`]);
            if (res.rows.length === 0) return null;
            return mapRowToBooking(res.rows[0]);
        } catch (err) {
            console.error('Error in getBookingById:', err);
            throw err;
        }
    },

    // 3. Create booking
    async createBooking(data) {
        try {
            const id = data.id || generateBookingId();
            const guestName = data.guestName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Valued Guest';
            const firstName = data.firstName || '';
            const lastName = data.lastName || '';
            const phone = data.phone || '';
            const email = data.email || '';
            const street = data.street || '';
            const street2 = data.street2 || '';
            const city = data.city || '';
            const state = data.state || '';
            const postal = data.postal || '';
            const country = data.country || 'Pakistan';
            const property = data.property || data.bookingType || 'Galiyat Stay';
            const bookingType = data.bookingType || 'Reservation';
            const roomType = data.roomType || 'Standard Room';
            const roomsCount = data.roomsCount || 1;
            const guestsCount = data.guestsCount || '2 adults · 0 children';
            const datetime = data.datetime || new Date().toLocaleString();
            const checkInDate = data.checkInDate || '';
            const checkOutDate = data.checkOutDate || '';
            const totalPrice = Number(data.totalPrice) || 0;
            const specialRequests = data.specialRequests || '';
            const confirmationChannel = data.confirmationChannel || 'Email';
            const comments = data.comments || '';
            const status = data.status || 'Pending';

            const query = `
                INSERT INTO bookings (
                    id, guest_name, first_name, last_name, phone, email, street, street2,
                    city, state, postal, country, property, booking_type, room_type,
                    rooms_count, guests_count, datetime, check_in_date, check_out_date,
                    total_price, special_requests, confirmation_channel, comments,
                    status, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8,
                    $9, $10, $11, $12, $13, $14, $15,
                    $16, $17, $18, $19, $20,
                    $21, $22, $23, $24,
                    $25, NOW(), NOW()
                ) RETURNING *;
            `;

            const res = await pool.query(query, [
                id, guestName, firstName, lastName, phone, email, street, street2,
                city, state, postal, country, property, bookingType, roomType,
                roomsCount, guestsCount, datetime, checkInDate, checkOutDate,
                totalPrice, specialRequests, confirmationChannel, comments,
                status
            ]);

            return mapRowToBooking(res.rows[0]);
        } catch (err) {
            console.error('Error in createBooking:', err);
            throw err;
        }
    },

    // 4. Update booking status
    async updateBookingStatus(id, newStatus) {
        try {
            const cleanId = id.startsWith('#') ? id.substring(1) : id;
            let query = `
                UPDATE bookings 
                SET status = $1, updated_at = NOW() 
                WHERE id = $2 OR id = $3 
                RETURNING *;
            `;
            let params = [newStatus, cleanId, `#${cleanId}`];

            if (newStatus === 'Confirmed') {
                query = `
                    UPDATE bookings 
                    SET status = $1, confirmed_at = NOW(), updated_at = NOW() 
                    WHERE id = $2 OR id = $3 
                    RETURNING *;
                `;
            }

            const res = await pool.query(query, params);
            if (res.rows.length === 0) return null;
            return mapRowToBooking(res.rows[0]);
        } catch (err) {
            console.error('Error in updateBookingStatus:', err);
            throw err;
        }
    },

    // 5. Delete booking
    async deleteBooking(id) {
        try {
            const cleanId = id.startsWith('#') ? id.substring(1) : id;
            const res = await pool.query('DELETE FROM bookings WHERE id = $1 OR id = $2 RETURNING id;', [cleanId, `#${cleanId}`]);
            return res.rows.length > 0;
        } catch (err) {
            console.error('Error in deleteBooking:', err);
            throw err;
        }
    },

    // 6. Add Email Log
    async addEmailLog(entry) {
        try {
            const logId = entry.id || Date.now().toString(36);
            await pool.query(`
                INSERT INTO email_logs (log_id, type, to_email, subject, preview_url, status, error, sent_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW());
            `, [
                logId,
                entry.type || 'General',
                entry.to || '',
                entry.subject || '',
                entry.previewUrl || null,
                entry.status || 'Sent',
                entry.error || null
            ]);
        } catch (err) {
            console.warn('Error saving email log to PostgreSQL:', err.message);
        }
    },

    // 7. Get Email Logs
    async getEmailLogs() {
        try {
            const res = await pool.query('SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 100;');
            return res.rows.map(mapRowToEmailLog);
        } catch (err) {
            console.error('Error in getEmailLogs:', err);
            return [];
        }
    }
};

module.exports = Database;
