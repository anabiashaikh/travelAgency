const crypto = require('crypto');
const logger = require('../config/logger');

function requestLogger(req, res, next) {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    req.id = requestId;
    res.setHeader('X-Request-ID', requestId);

    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const meta = {
            requestId,
            method: req.method,
            path: req.originalUrl || req.url,
            status: res.statusCode,
            durationMs: duration,
            ip: req.ip || req.connection?.remoteAddress
        };

        if (res.statusCode >= 500) {
            logger.error(`HTTP ${req.method} ${req.originalUrl || req.url} ${res.statusCode} (${duration}ms)`, meta);
        } else if (res.statusCode >= 400) {
            logger.warn(`HTTP ${req.method} ${req.originalUrl || req.url} ${res.statusCode} (${duration}ms)`, meta);
        } else {
            logger.info(`HTTP ${req.method} ${req.originalUrl || req.url} ${res.statusCode} (${duration}ms)`, meta);
        }
    });

    next();
}

module.exports = requestLogger;
