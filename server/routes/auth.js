const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Check and create admin user if needed
router.get('/check-admin', async (req, res) => {
  try {
    let adminUser = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!adminUser) {
      // Create default admin user
      const passwordHash = await bcrypt.hash('admin123', 10);
      adminUser = await User.create({
        name: 'System Administrator',
        email: 'admin@gmail.com',
        passwordHash,
        role: 'admin'
      });
      res.json({ 
        message: 'Admin user created', 
        admin: { email: adminUser.email, role: adminUser.role },
        defaultPassword: 'admin123'
      });
    } else {
      res.json({ 
        message: 'Admin user exists', 
        admin: { email: adminUser.email, role: adminUser.role }
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin creates new agent (adds to users collection)
router.post('/create-agent', async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    
    if (!name || !email || !password || !location) {
      return res.status(400).json({ message: 'Name, email, password, and location are required' });
    }
    
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create new agent user
    const newAgent = await User.create({
      name,
      email,
      passwordHash,
      role: 'agent',
      location,
      isActive: true
    });
    
    // Return agent without password
    const { passwordHash: _, ...agentWithoutPassword } = newAgent.toObject();
    res.status(201).json({ 
      message: 'Agent created successfully',
      agent: agentWithoutPassword 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all agents (users with agent role)
router.get('/agents', async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' }, '-passwordHash');
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update agent
router.put('/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // If password is being updated, hash it
    if (updateData.password) {
      updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }
    
    const updatedAgent = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedAgent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json(updatedAgent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete agent (soft delete)
router.delete('/agents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-passwordHash');

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({ message: 'Agent deactivated successfully', agent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }
    
    // Auto-assign admin role for admin@gmail.com
    let role = 'agent';
    if (email === 'admin@gmail.com') {
      role = 'admin';
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role });
    const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    
    // Check if this is admin@gmail.com and update role if needed
    if (email === 'admin@gmail.com' && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }
    
    const token = jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.sub).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
