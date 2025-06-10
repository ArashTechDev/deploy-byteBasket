const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./api/auth.routes');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes once
app.use('/api/auth', authRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bytebasket')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('DB connection error:', err));

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
