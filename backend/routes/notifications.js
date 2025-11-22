import express from 'express';
import mongoose from 'mongoose';
import { authenticate } from '../middleware/auth.js';
import CalendarEvent from '../models/CalendarEvent.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get upcoming outfit notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!userId) {
      logger.warn('Notifications request without userId');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Get user preferences
    const user = await User.findById(userId);
    if (!user) {
      logger.warn('User not found for notifications', { userId });
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if notifications are enabled (default to true if preferences don't exist)
    const notificationsEnabled = user.preferences?.notificationsEnabled !== false;
    if (!notificationsEnabled) {
      return res.json({ notifications: [] });
    }

    // Get notifications for next 7 days
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999);

    let upcomingEvents;
    try {
      upcomingEvents = await CalendarEvent.find({
        userId,
        date: {
          $gte: now,
          $lte: sevenDaysFromNow,
        },
      })
        .populate({
          path: 'outfitId',
          select: 'name image',
          // Return null if outfit doesn't exist instead of failing
          strictPopulate: false
        })
        .sort({ date: 1 })
        .lean();
    } catch (queryError) {
      logger.error('Error querying calendar events:', {
        error: queryError.message,
        userId,
        stack: queryError.stack,
      });
      // Return empty notifications instead of failing
      return res.json({ notifications: [] });
    }

    // Ensure we have an array
    if (!Array.isArray(upcomingEvents)) {
      logger.warn('upcomingEvents is not an array', { type: typeof upcomingEvents, userId });
      return res.json({ notifications: [] });
    }

    // Get read notifications from user
    const readNotificationIds = user.readNotifications || [];
    
    // Format notifications and filter out read ones
    const notifications = upcomingEvents
      .filter(event => !readNotificationIds.some(readId => readId.toString() === event._id.toString()))
      .map(event => {
        try {
          const eventDate = new Date(event.date);
          if (isNaN(eventDate.getTime())) {
            logger.warn('Invalid date in calendar event', { eventId: event._id, date: event.date });
            return null;
          }
          
          const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
          
          return {
            id: event._id,
            type: 'outfit_reminder',
            title: 'Upcoming Outfit',
            message: `You have "${event.outfitId?.name || 'an outfit'}" scheduled ${daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}`,
            date: event.date,
            outfitId: event.outfitId?._id || null,
            outfitName: event.outfitId?.name || null,
            outfitImage: event.outfitId?.image || null,
            location: event.location || null,
            occasion: event.occasion || null,
            daysUntil,
            createdAt: event.createdAt,
          };
        } catch (eventError) {
          logger.error('Error formatting notification event:', { eventId: event._id, error: eventError });
          return null;
        }
      })
      .filter(Boolean); // Remove null entries

    res.json({ notifications });
  } catch (error) {
    logger.error('Error fetching notifications:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });
    res.status(500).json({ 
      message: 'Error fetching notifications', 
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
    });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all upcoming events for the next 7 days
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999);

    const upcomingEvents = await CalendarEvent.find({
      userId,
      date: {
        $gte: now,
        $lte: sevenDaysFromNow,
      },
    }).select('_id').lean();

    // Add all event IDs to readNotifications (avoid duplicates)
    const eventIds = upcomingEvents.map(event => event._id.toString());
    const existingReadIds = (user.readNotifications || []).map(id => id.toString());
    const combinedIds = [...new Set([...existingReadIds, ...eventIds])];
    
    // Convert back to ObjectIds
    const readNotificationIds = combinedIds
      .map(id => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch (error) {
          logger.warn('Invalid ObjectId in readNotifications:', id);
          return null;
        }
      })
      .filter(Boolean);
    
    user.readNotifications = readNotificationIds;
    await user.save();

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Error marking notifications as read', error: error.message });
  }
});

// Mark a specific notification as read
router.post('/:id/read', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add notification ID to readNotifications if not already there
    const readNotifications = user.readNotifications || [];
    const notificationObjectId = new mongoose.Types.ObjectId(notificationId);
    
    if (!readNotifications.some(id => id.toString() === notificationId)) {
      readNotifications.push(notificationObjectId);
      user.readNotifications = readNotifications;
      await user.save();
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
});

export default router;

