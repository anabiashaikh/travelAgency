const AuthService = require('./auth.service');
const env = require('../../config/env');
const logger = require('../../config/logger');

const AuthController = {
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { token, user } = await AuthService.login(email, password);

            // Set secure HTTP-only cookie
            res.cookie(env.COOKIE_NAME, token, {
                httpOnly: true,
                secure: env.IS_PROD,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            logger.info(`Admin login successful: ${user.email} (${user.role})`, {
                adminId: user.id,
                ip: req.ip
            });

            return res.json({
                success: true,
                message: 'Authentication successful.',
                token,
                data: {
                    user
                }
            });
        } catch (err) {
            next(err);
        }
    },

    async logout(req, res, next) {
        try {
            res.clearCookie(env.COOKIE_NAME, {
                httpOnly: true,
                secure: env.IS_PROD,
                sameSite: 'lax'
            });

            logger.info(`Admin logged out: ${req.user?.email}`, {
                adminId: req.user?.id
            });

            return res.json({
                success: true,
                message: 'Logged out successfully.'
            });
        } catch (err) {
            next(err);
        }
    },

    async getMe(req, res, next) {
        try {
            return res.json({
                success: true,
                data: {
                    user: req.user
                }
            });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = AuthController;
