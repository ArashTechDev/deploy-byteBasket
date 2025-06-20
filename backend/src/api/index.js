// backend/src/api/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const inventoryRoutes = require('./inventory');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const foodBankRoutes = require('./foodbank');

// Mount routes
router.use('/inventory', inventoryRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/foodbanks', foodBankRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'ByteBasket API'
  });
});

module.exports = router;
