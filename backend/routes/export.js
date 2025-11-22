import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Clothing from '../models/Clothing.js';
import Outfit from '../models/Outfit.js';
import CalendarEvent from '../models/CalendarEvent.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Export data endpoint
router.get('/data', authenticate, async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const userId = req.user._id;

    // Fetch all user data
    const [clothing, outfits, calendarEvents] = await Promise.all([
      Clothing.find({ userId }).lean(),
      Outfit.find({ userId }).populate('items').lean(),
      CalendarEvent.find({ userId }).populate('outfitId').lean(),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        name: req.user.name,
        email: req.user.email,
      },
      clothing: clothing.map(item => ({
        name: item.name,
        category: item.category,
        color: item.color,
        brand: item.brand,
        tags: item.tags,
        image: item.image,
        createdAt: item.createdAt,
      })),
      outfits: outfits.map(outfit => ({
        name: outfit.name,
        description: outfit.description,
        items: outfit.items.map(item => ({
          name: item.name,
          category: item.category,
          color: item.color,
        })),
        tags: outfit.tags,
        occasion: outfit.occasion,
        season: outfit.season,
        isFavorite: outfit.isFavorite,
        createdAt: outfit.createdAt,
      })),
      calendarEvents: calendarEvents.map(event => ({
        date: event.date,
        outfitName: event.outfitId?.name || 'Unknown',
        occasion: event.occasion,
        location: event.location,
        notes: event.notes,
        weather: event.weather,
        createdAt: event.createdAt,
      })),
    };

    if (format === 'csv') {
      // Convert to CSV
      let csv = 'Type,Name,Category,Color,Brand,Tags,Date\n';
      
      // Clothing items
      clothing.forEach(item => {
        csv += `Clothing,"${item.name || ''}","${item.category || ''}","${item.color || ''}","${item.brand || ''}","${item.tags?.join(';') || ''}","${item.createdAt || ''}"\n`;
      });
      
      // Outfits
      outfits.forEach(outfit => {
        csv += `Outfit,"${outfit.name || ''}","${outfit.occasion?.join(';') || ''}","","","${outfit.tags?.join(';') || ''}","${outfit.createdAt || ''}"\n`;
      });
      
      // Calendar events
      calendarEvents.forEach(event => {
        csv += `Calendar Event,"${event.outfitId?.name || ''}","${event.occasion || ''}","","","${event.location || ''}","${event.date || ''}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=digital-closet-export-${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=digital-closet-export-${new Date().toISOString().split('T')[0]}.json`);
      return res.json(exportData);
    }
  } catch (error) {
    logger.error('Error exporting data:', error);
    res.status(500).json({ message: 'Error exporting data', error: error.message });
  }
});

export default router;

