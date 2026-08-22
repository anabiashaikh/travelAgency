const { query } = require('../../config/database');

const AuthRepository = {
    async findByEmail(email) {
        const res = await query(
            'SELECT * FROM admin_users WHERE LOWER(email) = LOWER($1) AND is_active = true LIMIT 1;',
            [email.trim()]
        );
        return res.rows[0] || null;
    },

    async findById(id) {
        const res = await query(
            'SELECT id, email, full_name, role, is_active, last_login_at, created_at FROM admin_users WHERE id = $1 AND is_active = true LIMIT 1;',
            [id]
        );
        return res.rows[0] || null;
    },

    async updateLastLogin(id) {
        await query(
            'UPDATE admin_users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1;',
            [id]
        );
    }
};

module.exports = AuthRepository;
