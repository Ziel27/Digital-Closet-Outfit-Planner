import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Clothing from '../models/Clothing.js';
import Outfit from '../models/Outfit.js';
import CalendarEvent from '../models/CalendarEvent.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get user analytics
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all user data
    const [clothing, outfits, calendarEvents] = await Promise.all([
      Clothing.find({ userId }).lean(),
      Outfit.find({ userId }).lean(),
      CalendarEvent.find({ userId }).populate('outfitId').lean(),
    ]);

    // Calculate statistics
    const totalClothing = clothing.length;
    const totalOutfits = outfits.length;
    const favoriteOutfits = outfits.filter(o => o.isFavorite).length;
    const scheduledOutfits = calendarEvents.length;

    // Category distribution
    const categoryCount = {};
    clothing.forEach(item => {
      const cat = item.category || 'other';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    // Color distribution
    const colorCount = {};
    clothing.forEach(item => {
      if (item.color) {
        const colors = Array.isArray(item.color) ? item.color : [item.color];
        colors.forEach(color => {
          colorCount[color] = (colorCount[color] || 0) + 1;
        });
      }
    });

    // Most used outfits (by calendar events)
    const outfitUsage = {};
    calendarEvents.forEach(event => {
      const outfitId = event.outfitId?._id?.toString() || 'unknown';
      outfitUsage[outfitId] = (outfitUsage[outfitId] || 0) + 1;
    });

    const mostUsedOutfits = Object.entries(outfitUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([outfitId, count]) => {
        const outfit = outfits.find(o => o._id.toString() === outfitId);
        return {
          outfitId,
          name: outfit?.name || 'Unknown',
          count,
        };
      });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentClothing = clothing.filter(
      item => new Date(item.createdAt) >= thirtyDaysAgo
    ).length;
    
    const recentOutfits = outfits.filter(
      outfit => new Date(outfit.createdAt) >= thirtyDaysAgo
    ).length;

    // Upcoming scheduled outfits (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const upcomingOutfits = calendarEvents.filter(
      event => {
        const eventDate = new Date(event.date);
        return eventDate >= new Date() && eventDate <= sevenDaysFromNow;
      }
    ).length;

    res.json({
      overview: {
        totalClothing,
        totalOutfits,
        favoriteOutfits,
        scheduledOutfits,
        upcomingOutfits,
      },
      distributions: {
        categories: categoryCount,
        colors: colorCount,
      },
      insights: {
        mostUsedOutfits,
        recentActivity: {
          clothingAdded: recentClothing,
          outfitsCreated: recentOutfits,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

export default router;

