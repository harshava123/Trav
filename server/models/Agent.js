const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    enum: ['Hyderabad', 'Chennai', 'Bangalore', 'Kerala', 'Mumbai']
  },
  role: {
    type: String,
    default: 'agent',
    enum: ['admin', 'agent']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Agent', agentSchema);

