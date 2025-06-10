const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const User = require('../models/User.model');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /register - Register user
router.post('/register', authController.register);

// POST /login - Login user and return JWT token
router.post('/login', authController.login);

// GET /verify-email - Email verification
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) return res.status(400).send('Missing token');

    const user = await User.findOne({ verificationToken: token });

    if (!user) return res.status(400).send('Invalid or expired token');

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send('Email verified successfully! You can now log in.');
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).send('Server error during email verification');
  }
});

// GET /dashboard - Protected route
router.get('/dashboard', authMiddleware, (req, res) => {
  res.send(`Welcome ${req.user.role}! You are logged in.`);
});

module.exports = router;
