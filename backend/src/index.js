// backend/src/index.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// MongoDB connection
const { connectMongoDB } = require('./config/mongodb');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Routes
const authRoutes = require('./api/auth.routes');
const inventoryRoutes = require('./api/routes/inventory'); // Updated MongoDB routes

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
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
    database: 'MongoDB'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes); // MongoDB inventory routes

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    
    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();