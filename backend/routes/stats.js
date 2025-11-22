import express from 'express';
import User from '../models/User.js';
import Outfit from '../models/Outfit.js';
import Clothing from '../models/Clothing.js';
import CalendarEvent from '../models/CalendarEvent.js';

const router = express.Router();

// Get public statistics (no authentication required)
router.get('/public', async (req, res) => {
  try {
    // Get total user count
    const totalUsers = await User.countDocuments();
    
    // Get total outfits created
    const totalOutfits = await Outfit.countDocuments();
    
    // Get total clothing items
    const totalClothingItems = await Clothing.countDocuments();
    
    // Get total calendar events (outfits planned)
    const totalPlannedOutfits = await CalendarEvent.countDocuments();
    
    // Calculate average outfits per user
    const avgOutfitsPerUser = totalUsers > 0 ? Math.round(totalOutfits / totalUsers) : 0;
    
    // Get recent users count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    res.json({
      totalUsers,
      totalOutfits,
      totalClothingItems,
      totalPlannedOutfits,
      avgOutfitsPerUser,
      recentUsers
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      message: 'Error fetching statistics', 
      error: error.message,
      // Return default values on error
      totalUsers: 0,
      totalOutfits: 0,
      totalClothingItems: 0,
      totalPlannedOutfits: 0,
      avgOutfitsPerUser: 0,
      recentUsers: 0
    });
  }
});

export default router;

