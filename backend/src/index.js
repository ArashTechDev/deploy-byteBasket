/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const apiRouter = require('./api');
const donationRoutes = require('./routes/donation.routes');

const app = express();


app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);
app.use('/api/donations', donationRoutes);


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bytebasket')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('DB connection error:', err));

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
