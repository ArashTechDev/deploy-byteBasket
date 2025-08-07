/* eslint-disable indent */
// backend/src/index.js
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import all route files
const authRoutes = require('./api/auth.routes');
const inventoryRoutes = require('./api/routes/inventory');
const donationRoutes = require('./routes/donation.routes');
const dietaryPreferencesRoutes = require('./routes/dietaryPreferences.routes');
const dietaryRestrictionsRoutes = require('./routes/dietaryRestrictions.routes');

// Import volunteer routes
const volunteerRoutes = require('./routes/volunteer.routes');
const shiftRoutes = require('./routes/shift.routes');
const volunteerShiftRoutes = require('./routes/volunteerShift.routes');

// Import cart/wishlist and reports routes
const cartRoutes = require('./routes/cart.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const basicReportsRoutes = require('./routes/basicReports.routes');

const app = express();

// Database connection function
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bytebasket', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['self'],
        styleSrc: ['self', 'unsafe-inline'],
        scriptSrc: ['self'],
        imgSrc: ['self', 'data:', 'https:'],
      },
    },
  })
);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://localhost:3000',
      'https://localhost:3001',
      'https://localhost:3002',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // In development, be more permissive
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 CORS: Allowing origin ${origin} in development mode`);
        callback(null, true);
      } else {
        console.log(`❌ CORS: Blocking origin ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

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
app.use('/api/cart', cartRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/basic-reports', basicReportsRoutes);

// API Health endpoint
app.get('/api/health', async (req, res) => {
  try {
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

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    console.log('🔄 Starting ByteBasket Backend Server...');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Connect to MongoDB first
    await connectMongoDB();
    console.log('✅ Database connection established');

    // Start the server
    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/`);

      if (process.env.NODE_ENV === 'development') {
        console.log('\n👥 Demo Login Credentials:');
        console.log('   Admin: admin@demo.com / demo123');
        console.log('   Staff: staff@demo.com / demo123');
        console.log('   Donor: donor@demo.com / demo123');
        console.log('\n📦 To setup demo data: npm run setup:demo');
        console.log('\n🆕 NEW Volunteer Endpoints:');
        console.log('   📋 /api/volunteers');
        console.log('   📅 /api/shifts');
        console.log('   🤝 /api/volunteer-shifts');
      }
    });

    // Handle server errors
    server.on('error', error => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          console.error(`❌ Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async signal => {
  console.log(`\n🔄 ${signal} received, shutting down gracefully...`);

  try {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
};

// Process event listeners
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', err.message);
  console.error('Promise:', promise);

  // Don't exit immediately in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.error('⚠️ Continuing in development mode...');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  console.error('🚨 Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
