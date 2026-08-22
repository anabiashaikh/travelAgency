const env = require('../config/env');
const AuthService = require('../modules/auth/auth.service');

function authenticate(req, res, next) {
    let token = null;

    // 1. Check HTTP-only cookie
    if (req.cookies && req.cookies[env.COOKIE_NAME]) {
        token = req.cookies[env.COOKIE_NAME];
    }

    // 2. Check Authorization Bearer header
    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required to access this resource.'
            }
        });
    }

    try {
        const decoded = AuthService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: err.message
            }
        });
    }
}

module.exports = authenticate;
