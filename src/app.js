const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const securityHeaders = require('./middleware/securityHeaders');
const corsMiddleware = require('./middleware/cors');
const requestLogger = require('./middleware/requestLogger');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFound');

// Domain Routers
const authRoutes = require('./modules/auth/auth.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const bookingRoutes = require('./modules/bookings/booking.routes');
const propertiesRoutes = require('./modules/properties/properties.routes');
const flightsRoutes = require('./modules/flights/flights.routes');

const app = express();

// Trust proxy for accurate IP tracking in Vercel / reverse proxies
app.set('trust proxy', 1);

// 1. Security Headers
app.use(securityHeaders);

// 2. CORS
app.use(corsMiddleware);

// 3. Body Parsing & Cookies
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. Structured Request Logger
app.use(requestLogger);

// 5. General Rate Limiter on API paths
app.use('/api', generalLimiter);

// 6. Serve static files from /public directory
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR, {
    maxAge: '1h',
    etag: true
}));

// 7. Mount Domain API Routes
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/flights', flightsRoutes);

// Public bookings API (support both /api and /api/v1)
app.use('/api', bookingRoutes);
app.use('/api/v1', bookingRoutes);

// 8. Root Homepage Route
app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// 9. Static HTML Page Fallback
app.get('*', (req, res, next) => {
    // If request is for an API route, hand off to 404 handler
    if (req.path.startsWith('/api')) {
        return next();
    }

    const requestedPath = path.join(PUBLIC_DIR, req.path);
    if (requestedPath.endsWith('.html') && require('fs').existsSync(requestedPath)) {
        return res.sendFile(requestedPath);
    }

    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// 10. 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
