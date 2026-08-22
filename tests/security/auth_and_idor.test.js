const { test, describe } = require('node:test');
const assert = require('node:assert');
const authorize = require('../../src/middleware/authorize');

describe('Security & Access Control Tests', () => {

    test('authorize middleware blocks unauthenticated requests (missing req.user)', () => {
        const mw = authorize(['admin']);
        const req = {}; // no req.user
        let statusSet = null;
        let jsonSent = null;

        const res = {
            status(s) {
                statusSet = s;
                return {
                    json(j) {
                        jsonSent = j;
                    }
                };
            }
        };

        let nextCalled = false;
        mw(req, res, () => { nextCalled = true; });

        assert.strictEqual(nextCalled, false);
        assert.strictEqual(statusSet, 401);
        assert.strictEqual(jsonSent.error.code, 'UNAUTHORIZED');
    });

    test('authorize middleware blocks unauthorized role (manager trying admin action)', () => {
        const mw = authorize(['admin']);
        const req = {
            user: {
                id: 'usr_manager',
                email: 'manager@exploregaliyat.com',
                role: 'manager'
            }
        };

        let statusSet = null;
        let jsonSent = null;
        const res = {
            status(s) {
                statusSet = s;
                return {
                    json(j) {
                        jsonSent = j;
                    }
                };
            }
        };

        let nextCalled = false;
        mw(req, res, () => { nextCalled = true; });

        assert.strictEqual(nextCalled, false);
        assert.strictEqual(statusSet, 403);
        assert.strictEqual(jsonSent.error.code, 'FORBIDDEN');
    });

    test('authorize middleware grants access to matching role', () => {
        const mw = authorize(['admin', 'manager']);
        const req = {
            user: {
                id: 'usr_admin',
                email: 'admin@exploregaliyat.com',
                role: 'admin'
            }
        };

        let nextCalled = false;
        mw(req, {}, () => { nextCalled = true; });

        assert.strictEqual(nextCalled, true);
    });
});
