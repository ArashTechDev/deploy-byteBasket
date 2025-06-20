// backend/src/config/mongodb.js
const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/bytebasket';
    
    const options = {
      dbName: 'ByteBasket',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // Disable mongoose buffering
    };

    await mongoose.connect(mongoURI, options);
    
    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { connectMongoDB };