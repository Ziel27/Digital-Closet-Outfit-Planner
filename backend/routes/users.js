import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, avatar, onboardingCompleted, preferences } = req.body;
    
    // Get current user to merge preferences properly
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const updateData = { updatedAt: Date.now() };
    
    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (onboardingCompleted !== undefined) updateData.onboardingCompleted = onboardingCompleted;
    
    // Merge preferences properly
    if (preferences !== undefined) {
      // Ensure we have default preferences structure
      const defaultPreferences = {
        notificationsEnabled: true,
        notificationTime: '09:00',
        theme: 'system'
      };
      
      updateData.preferences = {
        ...defaultPreferences,
        ...(currentUser.preferences || {}),
        ...preferences
      };
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

export default router;

