const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

/**
 * Helper to mask sensitive values in logs
 */
function maskSecret(val) {
    if (!val || typeof val !== 'string') return '***';
    if (val.length <= 6) return '***';
    return `${val.substring(0, 3)}...${val.substring(val.length - 3)}`;
}

const isProduction = process.env.NODE_ENV === 'production';

// Configuration Object
const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    IS_PROD: isProduction,
    PORT: parseInt(process.env.PORT, 10) || 8080,
    APP_URL: process.env.APP_URL || 'http://localhost:8080',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : [
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            'https://travel-agency-ten-chi.vercel.app'
        ],
    
    // Database
    DATABASE_URL: process.env.DATABASE_URL || '',
    DB_POOL_MIN: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    DB_POOL_MAX: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    DB_IDLE_TIMEOUT_MS: parseInt(process.env.DB_IDLE_TIMEOUT_MS, 10) || 30000,
    DB_CONNECTION_TIMEOUT_MS: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS, 10) || 5000,

    // Authentication & Security
    JWT_SECRET: process.env.JWT_SECRET || (isProduction ? '' : 'dev-insecure-jwt-secret-key-change-in-prod-1234567890'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    COOKIE_NAME: process.env.COOKIE_NAME || 'agy_admin_session',
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,

    // Email SMTP
    SMTP_SERVICE: process.env.SMTP_SERVICE || 'gmail',
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_USER: (process.env.SMTP_USER || '').trim(),
    SMTP_PASS: (process.env.SMTP_PASS || '').replace(/\s+/g, '').trim(),
    EMAIL_FROM: process.env.EMAIL_FROM || '"Explore Galiyat Reservations" <reservations@exploregaliyat.com>',
    ADMIN_NOTIFICATION_EMAIL: (process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@exploregaliyat.com').trim(),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 mins
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    BOOKING_RATE_LIMIT_MAX: parseInt(process.env.BOOKING_RATE_LIMIT_MAX, 10) || 10, // max 10 bookings per 15 min per IP
    LOGIN_RATE_LIMIT_MAX: parseInt(process.env.LOGIN_RATE_LIMIT_MAX, 10) || 5, // max 5 login attempts per 15 min per IP

    maskSecret
};

/**
 * Validate required environment configuration
 */
function validateEnv() {
    const missing = [];

    if (!env.DATABASE_URL) {
        missing.push('DATABASE_URL');
    }

    if (isProduction && !process.env.JWT_SECRET) {
        missing.push('JWT_SECRET');
    }

    if (missing.length > 0) {
        const errorMsg = `[FATAL] Missing required environment variable(s): ${missing.join(', ')}`;
        if (isProduction) {
            throw new Error(errorMsg);
        } else {
            console.warn(`⚠️ [WARNING] ${errorMsg}. Running in development fallback mode.`);
        }
    }
}

validateEnv();

module.exports = env;
