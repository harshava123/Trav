const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Initialize express
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/loading-sheets', require('./routes/loadingSheets'));
app.use('/api/deliveries', require('./routes/deliveries'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
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
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Documentation:`);
  console.log(`   - Bookings: http://localhost:${PORT}/api/bookings`);
  console.log(`   - Loading Sheets: http://localhost:${PORT}/api/loading-sheets`);
  console.log(`   - Deliveries: http://localhost:${PORT}/api/deliveries`);
});
