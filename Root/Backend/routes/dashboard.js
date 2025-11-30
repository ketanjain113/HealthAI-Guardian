import express from 'express';
const router = express.Router();
import User from '../models/User.js';

// GET user dashboard data
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format response
    const dashboardData = {
      name: user.name,
      email: user.email,
      age: user.age || 20,
      gender: user.gender || 'Not specified',
      bloodGroup: user.bloodGroup || 'Unknown',
      height: user.height || 0,
      weight: user.weight || 0,
      roll: user.roll || 'N/A',
      department: user.department || 'N/A',
      emergency: user.emergency || 'N/A',
      avatar: user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
      vitals: user.vitals || { hr: 75, spo2: 98, temp: 98.6 },
      conditions: user.conditions || [],
      medicalHistory: user.medicalHistory || [],
      medications: user.medications || [],
      testResults: user.testResults || [],
      timeline: user.timeline || { hr: [], spo2: [], sleep: [], allergy: [] },
      lastScan: user.lastScan || { name: 'None', status: 'N/A', date: new Date() },
      doctor: user.doctor || { name: 'Not assigned' }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data', details: error.message });
  }
});

// POST - Add test result to user
router.post('/user/:userId/test-result', async (req, res) => {
  try {
    const { userId } = req.params;
    const { testType, result, confidence, severity, details } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add test result
    user.testResults.push({
      testType,
      result,
      confidence,
      severity,
      details,
      date: new Date()
    });

    // Update last scan
    user.lastScan = {
      name: testType,
      status: result,
      date: new Date()
    };

    await user.save();

    res.json({ 
      message: 'Test result added successfully', 
      testResults: user.testResults 
    });
  } catch (error) {
    console.error('Add test result error:', error);
    res.status(500).json({ error: 'Failed to add test result', details: error.message });
  }
});

// PUT - Update user health profile
router.put('/user/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// GET - Get all test results for a user
router.get('/user/:userId/test-results', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('testResults');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ testResults: user.testResults || [] });
  } catch (error) {
    console.error('Fetch test results error:', error);
    res.status(500).json({ error: 'Failed to fetch test results', details: error.message });
  }
});

export default router;
