// backend/src/api/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const inventoryRoutes = require('./inventory');
const authRoutes = require('./auth');
const foodBankRoutes = require('./foodbank');
const storageLocationRouter = require('./storageLocations');

// Mount routes
router.use('/inventory', inventoryRoutes);
router.use('/auth', authRoutes);
router.use('/foodbanks', foodBankRoutes);
router.use('/storage', storageLocationRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'ByteBasket API'
  });
});

module.exports = router;
