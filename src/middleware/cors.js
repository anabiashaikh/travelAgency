const cors = require('cors');
const env = require('../config/env');

const corsOptions = {
    origin(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        const allowed = env.ALLOWED_ORIGINS.some(allowedOrigin => {
            return origin === allowedOrigin || origin.endsWith('.vercel.app') || allowedOrigin === '*';
        });

        if (allowed) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS policy.`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'Idempotency-Key']
};

module.exports = cors(corsOptions);
