const logger = require('../config/logger');
const env = require('../config/env');

function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || err.status || 500;
    const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR');
    
    // Default safe message for 500 in production
    let message = err.message || 'An unexpected error occurred. Please try again later.';
    if (statusCode === 500 && env.IS_PROD) {
        message = 'An internal server error occurred. Our technical team has been notified.';
    }

    logger.error(`[UnhandledError] ${errorCode}: ${err.message}`, {
        requestId: req.id,
        path: req.originalUrl || req.url,
        method: req.method,
        statusCode,
        stack: env.IS_PROD ? undefined : err.stack
    });

    const errorPayload = {
        code: errorCode,
        message
    };

    if (err.details) {
        errorPayload.details = err.details;
    }

    return res.status(statusCode).json({
        success: false,
        error: errorPayload
    });
}

module.exports = errorHandler;
