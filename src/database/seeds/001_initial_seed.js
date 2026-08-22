const bcrypt = require('bcryptjs');
const logger = require('../../config/logger');

async function seedInitialData(pool) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Seed Admins
        const salt = await bcrypt.genSalt(10);
        const adminHash = await bcrypt.hash('Admin@Galiyat2026!', salt);
        const managerHash = await bcrypt.hash('Manager@Galiyat2026!', salt);

        await client.query(`
            INSERT INTO admin_users (id, email, password_hash, full_name, role, is_active)
            VALUES 
                ('adm_super', 'admin@exploregaliyat.com', $1, 'Galiyat Operations Admin', 'admin', true),
                ('adm_owner', 'anabiaxhaikh190@gmail.com', $1, 'Agency Principal', 'admin', true),
                ('adm_manager', 'manager@exploregaliyat.com', $2, 'Front Desk Operations', 'manager', true)
            ON CONFLICT (email) DO NOTHING;
        `, [adminHash, managerHash]);

        // 2. Seed Core Galiyat Properties
        await client.query(`
            INSERT INTO properties (id, name, slug, property_type, location_name, address, star_rating, starting_price, description, is_active)
            VALUES 
                ('prop_maria_villa', 'Maria Villa Retreat', 'maria-villa', 'villa', 'Khaira Gali', 'Pine Forest Road, Khaira Gali, KPK', 5, 18000.00, 'Exclusive luxury pine-view villa retreat with private lawn and scenic valley outlook.', true),
                ('prop_crown_inn', 'Crown Inn Hotel Service Apartments', 'crown-inn', 'apartment', 'Khaira Gali', 'Main Mall Road, Khaira Gali, KPK', 4, 29000.00, 'Premium fully-serviced family suites with modern amenities and scenic mountain balconies.', true),
                ('prop_pine_view', 'Pine View Resort Nathia Gali', 'pine-view', 'hotel', 'Nathia Gali', 'Governor House Road, Nathia Gali, KPK', 4, 15000.00, 'Scenic resort nestled in thick pine forests with panoramic valley viewpoints.', true)
            ON CONFLICT (id) DO NOTHING;
        `);

        // 3. Seed Core Room Types
        await client.query(`
            INSERT INTO room_types (id, property_id, name, description, base_price, capacity_adults, capacity_children, total_rooms)
            VALUES 
                ('room_mv_deluxe', 'prop_maria_villa', 'Deluxe Pine Villa Suite', 'Spacious master bedroom with fireplace and pine valley view.', 18000.00, 2, 2, 4),
                ('room_crown_one_bed', 'prop_crown_inn', 'Deluxe One-Bedroom Apartment', 'Complete serviced suite with living lounge, kitchen, and balcony.', 29000.00, 3, 2, 6),
                ('room_pine_deluxe', 'prop_pine_view', 'Mountain View Deluxe Room', 'Comfortable double room with central heating and hill view.', 15000.00, 2, 1, 8)
            ON CONFLICT (id) DO NOTHING;
        `);

        await client.query('COMMIT');
        logger.info('✔ Initial seeds checked / verified.');
    } catch (err) {
        await client.query('ROLLBACK');
        logger.error(`❌ Seeding failed: ${err.message}`);
    } finally {
        client.release();
    }
}

module.exports = { seedInitialData };
