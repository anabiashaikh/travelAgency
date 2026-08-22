const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const AuthRepository = require('./auth.repository');

const AuthService = {
    async login(email, password) {
        if (!email || !password) {
            const err = new Error('Email and password are required.');
            err.statusCode = 400;
            err.code = 'INVALID_CREDENTIALS';
            throw err;
        }

        const user = await AuthRepository.findByEmail(email);
        if (!user) {
            const err = new Error('Invalid email address or password.');
            err.statusCode = 401;
            err.code = 'AUTH_FAILED';
            throw err;
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            const err = new Error('Invalid email address or password.');
            err.statusCode = 401;
            err.code = 'AUTH_FAILED';
            throw err;
        }

        await AuthRepository.updateLastLogin(user.id);

        const payload = {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role
        };

        const token = jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN
        });

        return {
            token,
            user: payload
        };
    },

    verifyToken(token) {
        try {
            return jwt.verify(token, env.JWT_SECRET);
        } catch (err) {
            const error = new Error('Invalid or expired authentication token.');
            error.statusCode = 401;
            error.code = 'INVALID_TOKEN';
            throw error;
        }
    }
};

module.exports = AuthService;
