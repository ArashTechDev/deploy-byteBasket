// backend/src/api/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const User = require('../db/models/User'); 
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /register - Register user
router.post('/register', authController.register);

// POST /login - Login user and return JWT token
router.post('/login', authController.login);

// POST /logout - Logout user
router.post('/logout', authController.logout);

// GET /verify-email - Email verification
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Missing verification token'
      });
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
});

// GET /me - Get current user profile (protected route)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('foodbank_id', 'name location')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// GET /dashboard - Protected route for demo
router.get('/dashboard', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: `Welcome ${req.user.role}! You are logged in.`,
    user: {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email
    }
  });
});

module.exports = router;