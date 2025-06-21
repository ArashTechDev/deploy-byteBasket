// backend/src/api/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /register - Register user
router.post('/register', authController.register);

// POST /login - Login user and return JWT token
router.post('/login', authController.login);

// POST /logout - Logout user
router.post('/logout', authController.logout);

// Health check for auth routes
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;