const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Initialize express
const app = express();

// Connect to database
connectDB();

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CORS_ORIGIN || 'https://trav-frontend.onrender.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/loading-sheets', require('./routes/loadingSheets'));
app.use('/api/deliveries', require('./routes/deliveries'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`   - Register: http://localhost:${PORT}/api/auth/register`);
  console.log(`   - Check Admin: http://localhost:${PORT}/api/auth/check-admin`);
  console.log(`📚 API:`);
  console.log(`   - Bookings: http://localhost:${PORT}/api/bookings`);
  console.log(`   - Loading Sheets: http://localhost:${PORT}/api/loading-sheets`);
  console.log(`   - Deliveries: http://localhost:${PORT}/api/deliveries`);
});
