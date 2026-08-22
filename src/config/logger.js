const env = require('./env');

const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

const currentLevel = env.IS_PROD ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

function formatLog(level, message, meta = {}) {
    // Sanitize meta to prevent accidental secret logging
    const sanitizedMeta = { ...meta };
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'jwt', 'secret', 'DATABASE_URL', 'SMTP_PASS', 'cookie'];
    for (const key of Object.keys(sanitizedMeta)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
            sanitizedMeta[key] = '[REDACTED]';
        }
    }

    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(Object.keys(sanitizedMeta).length > 0 ? { meta: sanitizedMeta } : {})
    };

    return JSON.stringify(logEntry);
}

const logger = {
    error(message, meta) {
        if (currentLevel >= LOG_LEVELS.ERROR) {
            console.error(formatLog('ERROR', message, meta));
        }
    },
    warn(message, meta) {
        if (currentLevel >= LOG_LEVELS.WARN) {
            console.warn(formatLog('WARN', message, meta));
        }
    },
    info(message, meta) {
        if (currentLevel >= LOG_LEVELS.INFO) {
            console.log(formatLog('INFO', message, meta));
        }
    },
    debug(message, meta) {
        if (currentLevel >= LOG_LEVELS.DEBUG) {
            console.log(formatLog('DEBUG', message, meta));
        }
    }
};

module.exports = logger;
