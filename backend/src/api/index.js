const express = require('express');
const router = express.Router();

// Import existing routes
const foodbankRoutes = require('./foodbank');
const inventoryRoutes = require('./routes/inventory');
const storageLocationRoutes = require('./storageLocations');

// Import new donation routes
const donationRoutes = require('../routes/donation.routes');

// Use routes
router.use('/foodbanks', foodbankRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/storage', storageLocationRoutes);
router.use('/donations', donationRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'ByteBasket API is running!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
