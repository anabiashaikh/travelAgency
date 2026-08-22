const { test, describe } = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../src/config/env');
const AuthService = require('../../src/modules/auth/auth.service');

describe('Admin Authentication & RBAC Unit Tests', () => {

    test('Password hashing and comparison with bcrypt', async () => {
        const rawPassword = 'SecurePassword123!';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(rawPassword, salt);

        assert.ok(hash !== rawPassword);
        const isMatch = await bcrypt.compare(rawPassword, hash);
        assert.strictEqual(isMatch, true);

        const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
        assert.strictEqual(isWrongMatch, false);
    });

    test('JWT Token Generation and Verification', () => {
        const payload = {
            id: 'adm_123',
            email: 'admin@exploregaliyat.com',
            role: 'admin',
            fullName: 'Test Admin'
        };

        const secret = env.JWT_SECRET || 'test-secret-key-1234567890';
        const token = jwt.sign(payload, secret, { expiresIn: '1h' });
        assert.ok(typeof token === 'string' && token.length > 20);

        const decoded = jwt.verify(token, secret);
        assert.strictEqual(decoded.id, 'adm_123');
        assert.strictEqual(decoded.role, 'admin');
        assert.strictEqual(decoded.email, 'admin@exploregaliyat.com');
    });

    test('Invalid JWT Token should throw error on verification', () => {
        assert.throws(() => {
            AuthService.verifyToken('invalid.token.structure');
        });
    });
});
