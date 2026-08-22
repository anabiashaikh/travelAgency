function notFoundHandler(req, res, next) {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Endpoint ${req.method} ${req.originalUrl || req.url} does not exist.`
        }
    });
}

module.exports = notFoundHandler;
