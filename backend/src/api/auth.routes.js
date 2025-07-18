// backend/src/api/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const User = require('../db/models/users/User'); // Fixed path
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /register - Register user
router.post('/register', authController.register);

// POST /login - Login user and return JWT token
router.post('/login', authController.login);

// POST /logout - Logout user
router.post('/logout', authController.logout);

// GET /verify-email - Email verification
router.get('/verify-email', authController.verifyEmail);

// GET /test-verify-debug - Debug verification (REMOVE IN PRODUCTION)
router.get('/test-verify-debug', async (req, res) => {
  try {
    const { token } = req.query;
    console.log('🔍 Debug verification request:');
    console.log('   Token received:', token);
    console.log('   Token length:', token?.length);
    console.log('   Token type:', typeof token);
    
    const usersWithTokens = await User.find({ verificationToken: { $exists: true, $ne: null } }).select('email verificationToken');
    const user = await User.findOne({ verificationToken: token });
    
    res.json({
      success: true,
      debug: {
        tokenReceived: token,
        tokenLength: token?.length,
        tokenType: typeof token,
        userFound: !!user,
        totalUsersWithTokens: usersWithTokens.length,
        availableTokens: usersWithTokens.map(u => ({
          email: u.email,
          token: u.verificationToken,
          matches: u.verificationToken === token
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /resend-verification - Resend verification email
router.post('/resend-verification', authController.resendVerificationEmail);

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
