const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

async function runMigrations(pool) {
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
        logger.warn('Migrations directory not found, skipping migrations.');
        return;
    }

    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(100) PRIMARY KEY,
                applied_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        const appliedRes = await client.query('SELECT version FROM schema_migrations;');
        const appliedVersions = new Set(appliedRes.rows.map(r => r.version));

        for (const file of files) {
            if (!appliedVersions.has(file)) {
                logger.info(`Running database migration: ${file}...`);
                const sqlPath = path.join(migrationsDir, file);
                const sql = fs.readFileSync(sqlPath, 'utf8');

                await client.query('BEGIN');
                try {
                    await client.query(sql);
                    await client.query(
                        'INSERT INTO schema_migrations (version, applied_at) VALUES ($1, NOW()) ON CONFLICT (version) DO NOTHING;',
                        [file]
                    );
                    await client.query('COMMIT');
                    logger.info(`✔ Migration applied successfully: ${file}`);
                } catch (err) {
                    await client.query('ROLLBACK');
                    logger.error(`❌ Migration failed on ${file}: ${err.message}`);
                    throw err;
                }
            }
        }
        logger.info('✔ All database migrations are up to date.');
    } finally {
        client.release();
    }
}

module.exports = { runMigrations };
