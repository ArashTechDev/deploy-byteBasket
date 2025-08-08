// backend/src/index.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const apiRouter = require('./api');
const donationRoutes = require('./routes/donation.routes');
const authRoutes = require('./api/auth.routes');
const inventoryRoutes = require('./api/routes/inventory');
const dietaryPreferencesRoutes = require('./routes/dietaryPreferences.routes');
const dietaryRestrictionsRoutes = require('./routes/dietaryRestrictions.routes');
const cartRoutes = require('./routes/cart.routes');
const wishlistRoutes = require('./routes/wishlist.routes');

// Import NEW volunteer routes
const volunteerRoutes = require('./routes/volunteer.routes');
const shiftRoutes = require('./routes/shift.routes');
const volunteerShiftRoutes = require('./routes/volunteerShift.routes');

// Import contact routes
const contactRoutes = require('./routes/contact.routes');

// Import reports routes
const reportsRoutes = require('./routes/reports.routes');
const basicReportsRoutes = require('./routes/basicReports.routes');

// MongoDB connection
const { connectMongoDB } = require('./config/mongodb');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// Trust proxy for deployment platforms like Vercel
app.set('trust proxy', 1);

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
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More generous in development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  },
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const requestRoutes = require('./routes/request.routes');
app.use('/api/requests', requestRoutes);

// Health check endpoint (before authentication)
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
      contact: '/api/contact',
    },
  });
});

// API Routes - Combined from both versions
app.use('/api', apiRouter);
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/dietary-preferences', dietaryPreferencesRoutes);
app.use('/api/dietary-restrictions', dietaryRestrictionsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlists', wishlistRoutes);

// NEW: Add volunteer routes
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/volunteer-shifts', volunteerShiftRoutes);

// NEW: Add contact routes
app.use('/api/contact', contactRoutes);

// NEW: Add reports routes
app.use('/api/reports', reportsRoutes);
app.use('/api/reports', basicReportsRoutes);

// API Health endpoint - Enhanced version
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: {
        type: 'MongoDB',
        status: dbStatus,
        name: mongoose.connection.name || 'bytebasket',
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      service: 'ByteBasket API',
      version: '1.0.0',
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// 404 handler
app.use(notFound);

// Global error handler
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

        // Email configuration status
        const emailEnabled = String(process.env.ENABLE_EMAIL).toLowerCase() === 'true';
        if (!emailEnabled) {
          console.log('\n✉️  Emails are DISABLED (set ENABLE_EMAIL=true to enable)');
        } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
          console.log('\n✉️  Emails ENABLED via SMTP host:', process.env.SMTP_HOST);
        } else {
          console.log('\n✉️  Emails ENABLED (no SMTP configured) → Using Ethereal for dev previews');
          console.log('    A preview link will be printed after an email is sent.');
        }
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', err.message);
  console.error('Promise:', promise);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  console.error('🚨 Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = async signal => {
  console.log(`\n🔄 ${signal} received, shutting down gracefully...`);

  try {
    const mongoose = require('mongoose');
    await mongoose.connection.close(); // ✅ Using await instead of callback
    console.log('🔒 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
};

// Update the process event listeners to handle async:
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Also update the unhandled rejection handler to be less aggressive:
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

// Start the server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app; // Export for testing