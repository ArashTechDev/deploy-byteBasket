// backend/src/index.js
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import all route files
const authRoutes = require('./api/auth.routes');
const inventoryRoutes = require('./api/routes/inventory');
const donationRoutes = require('./api/routes/donations');
const dietaryPreferencesRoutes = require('./routes/dietaryPreferences.routes');
const dietaryRestrictionsRoutes = require('./routes/dietaryRestrictions.routes');
const volunteerRoutes = require('./api/routes/volunteers');
const shiftRoutes = require('./api/routes/shifts');
const volunteerShiftRoutes = require('./api/routes/volunteerShifts');

// NEW ROUTES FOR CART/WISHLIST AND REPORTS
const cartRoutes = require('./routes/cart.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const basicReportsRoutes = require('./routes/basicReports.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => {
    return req.path === '/health' || req.path === '/api/health';
  },
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'ByteBasket API',
    database: 'MongoDB',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ByteBasket API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      inventory: '/api/inventory',
      donations: '/api/donations',
      volunteers: '/api/volunteers',
      shifts: '/api/shifts',
      volunteerShifts: '/api/volunteer-shifts',
      cart: '/api/cart',
      wishlists: '/api/wishlists',
      basicReports: '/api/basic-reports',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/dietary-preferences', dietaryPreferencesRoutes);
app.use('/api/dietary-restrictions', dietaryRestrictionsRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/volunteer-shifts', volunteerShiftRoutes);

// NEW ROUTES
app.use('/api/cart', cartRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/basic-reports', basicReportsRoutes);

// Enhanced API Health endpoint
app.get('/api/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'ByteBasket API',
      version: '1.0.0',
      database: {
        status: dbStatus,
        name: 'MongoDB',
      },
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      features: {
        authentication: true,
        inventory: true,
        donations: true,
        volunteers: true,
        cart: true,
        wishlists: true,
        reports: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
    });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bytebasket', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('DB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
