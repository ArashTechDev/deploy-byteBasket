const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use(notFound);
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bytebasket')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('DB connection error:', err));

app.use('/api/auth', require('./api/auth.routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

