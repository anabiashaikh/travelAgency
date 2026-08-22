const logger = require('../config/logger');

function createRateLimiter(options = {}) {
    const windowMs = options.windowMs || 15 * 60 * 1000;
    const max = options.max || 100;
    const message = options.message || 'Too many requests, please try again later.';
    const code = options.code || 'RATE_LIMIT_EXCEEDED';

    const hits = new Map();

    // Periodic cleanup of expired entries
    const cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of hits.entries()) {
            if (now > record.resetTime) {
                hits.delete(key);
            }
        }
    }, windowMs);

    // Prevent interval from holding node event loop open in tests
    if (cleanupInterval.unref) cleanupInterval.unref();

    return function rateLimiterMiddleware(req, res, next) {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown-ip';
        const key = `${req.baseUrl || ''}:${req.path}:${ip}`;
        const now = Date.now();

        let record = hits.get(key);

        if (!record || now > record.resetTime) {
            record = {
                count: 1,
                resetTime: now + windowMs
            };
            hits.set(key, record);
        } else {
            record.count += 1;
        }

        const remaining = Math.max(0, max - record.count);
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

        if (record.count > max) {
            logger.warn(`Rate limit exceeded for IP ${ip} on ${req.originalUrl || req.url}`, {
                ip,
                endpoint: req.originalUrl || req.url,
                count: record.count,
                max
            });

            return res.status(429).json({
                success: false,
                error: {
                    code,
                    message,
                    retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000)
                }
            });
        }

        next();
    };
}

module.exports = {
    generalLimiter: createRateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 300,
        message: 'Too many general requests from this IP.'
    }),
    bookingLimiter: createRateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 15,
        code: 'BOOKING_RATE_LIMIT_EXCEEDED',
        message: 'Too many booking submissions from this IP. Please wait a few minutes before submitting again.'
    }),
    loginLimiter: createRateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 6,
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many failed login attempts. Please try again after 15 minutes.'
    }),
    emailResendLimiter: createRateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 5,
        code: 'EMAIL_RATE_LIMIT_EXCEEDED',
        message: 'Too many email resend requests. Please wait a few minutes.'
    }),
    contactLimiter: createRateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 10,
        code: 'CONTACT_RATE_LIMIT_EXCEEDED',
        message: 'Too many contact messages sent. Please wait a few minutes.'
    })
};
