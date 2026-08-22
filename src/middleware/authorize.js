function authorize(allowedRoles = []) {
    return function authorizeMiddleware(req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required.'
                }
            });
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: `Access denied. Role '${req.user.role}' lacks necessary permissions.`
                }
            });
        }

        next();
    };
}

module.exports = authorize;
