const { Pool } = require('pg');
const env = require('./env');
const logger = require('./logger');
const { runMigrations } = require('../database/migrator');
const { seedInitialData } = require('../database/seeds/001_initial_seed');

// Initialize PostgreSQL Connection Pool
const pool = new Pool({
    connectionString: env.DATABASE_URL,
    min: env.DB_POOL_MIN,
    max: env.DB_POOL_MAX,
    idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,
    connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    logger.error('Unexpected error on idle PostgreSQL client:', { error: err.message });
});

let isInitialized = false;

async function initDatabase() {
    if (isInitialized) return pool;
    try {
        logger.info('🐘 Connecting to PostgreSQL database...');
        // Test connection
        const client = await pool.connect();
        client.release();
        logger.info('✔ PostgreSQL connection established successfully.');

        // Run automated migrations
        await runMigrations(pool);

        // Run initial seed
        await seedInitialData(pool);

        isInitialized = true;
        return pool;
    } catch (err) {
        logger.error('❌ Failed to initialize database:', { error: err.message });
        throw err;
    }
}

/**
 * Execute parameterized query
 */
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        logger.debug('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (err) {
        logger.error('Database query error', { text, error: err.message });
        throw err;
    }
}

/**
 * Execute callback inside a database transaction
 */
async function transaction(callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        logger.error('Database transaction failed, rolled back.', { error: err.message });
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    pool,
    query,
    transaction,
    initDatabase
};
