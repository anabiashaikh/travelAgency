const express = require('express');
const router = express.Router();
const AuthController = require('./auth.controller');
const authenticate = require('../../middleware/auth');
const { loginLimiter } = require('../../middleware/rateLimiter');

// Public login route with rate limiting
router.post('/login', loginLimiter, AuthController.login);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);

module.exports = router;
