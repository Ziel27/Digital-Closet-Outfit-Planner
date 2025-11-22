import CalendarEvent from '../models/CalendarEvent.js';
import Outfit from '../models/Outfit.js';
import Clothing from '../models/Clothing.js';
import { getWeatherByLocation, getStyleSuggestions as getWeatherSuggestions } from '../services/weatherService.js';
import logger from '../utils/logger.js';
import { stripHtml, limitStringLength } from '../utils/htmlSanitize.js';
import { escapeRegExp } from '../utils/sanitize.js';

// Helper function for pagination
const paginate = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * limitNum;
  
  return { page: pageNum, limit: limitNum, skip };
};

// Get calendar events for a date range with pagination
export const getCalendarEvents = async (req, res) => {
  try {
    const { startDate, endDate, page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);
    
    const query = { userId: req.user._id };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ 
          message: 'Invalid date format. Please use ISO 8601 format (YYYY-MM-DD).' 
        });
      }
      
      if (end < start) {
        return res.status(400).json({ 
          message: 'End date must be after start date.' 
        });
      }
      
      query.date = {
        $gte: start,
        $lte: end
      };
    } else if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ 
          message: 'Invalid date format. Please use ISO 8601 format (YYYY-MM-DD).' 
        });
      }
      query.date = { $gte: start };
    }

    const [events, total] = await Promise.all([
      CalendarEvent.find(query)
        .populate('outfitId')
        .sort({ date: 1 })
        .skip(skip)
        .limit(limitNum),
      CalendarEvent.countDocuments(query)
    ]);

    res.json({
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: skip + limitNum < total,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    logger.error('Error fetching calendar events:', error);
    res.status(500).json({ 
      message: 'Unable to retrieve calendar events. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get calendar event by date
export const getCalendarEventByDate = async (req, res) => {
  try {
    const dateParam = req.params.date;
    const date = new Date(dateParam);
    
    // Validate date is valid
    if (isNaN(date.getTime())) {
      return res.status(400).json({ 
        message: 'Invalid date format. Please use ISO 8601 format (YYYY-MM-DD).' 
      });
    }
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const event = await CalendarEvent.findOne({
      userId: req.user._id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('outfitId');

    if (!event) {
      return res.status(404).json({ 
        message: 'No outfit scheduled for this date.' 
      });
    }

    res.json(event);
  } catch (error) {
    logger.error('Error fetching calendar event:', error);
    res.status(500).json({ 
      message: 'Unable to retrieve calendar event. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single calendar event
export const getCalendarEventById = async (req, res) => {
  try {
    const event = await CalendarEvent.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('outfitId');

    if (!event) {
      return res.status(404).json({ 
        message: 'Calendar event not found. It may have been deleted or you don\'t have access to it.' 
      });
    }

    res.json(event);
  } catch (error) {
    logger.error('Error fetching calendar event:', error);
    res.status(500).json({ 
      message: 'Unable to retrieve calendar event. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create calendar event
export const createCalendarEvent = async (req, res) => {
  try {
    // Verify outfit belongs to user
    const outfit = await Outfit.findOne({
      _id: req.body.outfitId,
      userId: req.user._id
    });

    if (!outfit) {
      return res.status(404).json({ 
        message: 'Outfit not found. Please select a valid outfit from your collection.' 
      });
    }

    // Check if there's already an event for this date
    const date = new Date(req.body.date);
    const existingEvent = await CalendarEvent.findOne({
      userId: req.user._id,
      date: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      }
    });

    if (existingEvent) {
      return res.status(400).json({ 
        message: 'You already have an outfit scheduled for this date. Please choose a different date or update the existing event.' 
      });
    }

    // Get weather if location is provided
    let weather = null;
    let styleSuggestions = [];
    if (req.body.location) {
      weather = await getWeatherByLocation(req.body.location);
      if (weather && outfit.items) {
        // Get clothing items for better suggestions
        const clothingItems = await Clothing.find({
          _id: { $in: outfit.items },
          userId: req.user._id
        });
        styleSuggestions = getWeatherSuggestions(weather, req.body.occasion || 'casual', clothingItems);
      } else if (weather) {
        styleSuggestions = getWeatherSuggestions(weather, req.body.occasion || 'casual');
      }
    }

    // Sanitize inputs
    const sanitizedData = {
      outfitId: req.body.outfitId,
      date: req.body.date,
      occasion: req.body.occasion || 'casual',
      location: req.body.location ? stripHtml(limitStringLength(req.body.location.trim(), 100)) : undefined,
      notes: req.body.notes ? stripHtml(limitStringLength(req.body.notes.trim(), 500)) : undefined,
      userId: req.user._id,
      weather
    };

    const event = await CalendarEvent.create(sanitizedData);

    const populatedEvent = await CalendarEvent.findById(event._id).populate('outfitId');
    logger.info(`Calendar event created: ${event._id} by user ${req.user._id}`);

    res.status(201).json({
      event: populatedEvent,
      styleSuggestions
    });
  } catch (error) {
    logger.error('Error creating calendar event:', error);
    res.status(500).json({ 
      message: 'Unable to schedule outfit. Please check your input and try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update calendar event
export const updateCalendarEvent = async (req, res) => {
  try {
    // If outfitId is being updated, verify it belongs to user
    if (req.body.outfitId) {
      const outfit = await Outfit.findOne({
        _id: req.body.outfitId,
        userId: req.user._id
      });

      if (!outfit) {
        return res.status(404).json({ 
          message: 'Outfit not found. Please select a valid outfit from your collection.' 
        });
      }
    }

    // If date is being updated, check for conflicts (excluding current event)
    if (req.body.date) {
      const date = new Date(req.body.date);
      const existingEvent = await CalendarEvent.findOne({
        userId: req.user._id,
        _id: { $ne: req.params.id }, // Exclude current event
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999))
        }
      });

      if (existingEvent) {
        return res.status(400).json({ 
          message: 'You already have an outfit scheduled for this date. Please choose a different date or update the existing event.' 
        });
      }
    }

    // Get weather if location is provided
    let weather = req.body.weather;
    let styleSuggestions = [];
    
    if (req.body.location) {
      const newWeather = await getWeatherByLocation(req.body.location);
      if (newWeather) {
        weather = newWeather;
        // Get outfit for suggestions if available
        const outfitId = req.body.outfitId || (await CalendarEvent.findById(req.params.id))?.outfitId;
        if (outfitId) {
          const outfit = await Outfit.findOne({
            _id: outfitId,
            userId: req.user._id
          }).populate('items');
          
          if (outfit && outfit.items) {
            styleSuggestions = getWeatherSuggestions(weather, req.body.occasion || 'casual', outfit.items);
          } else {
            styleSuggestions = getWeatherSuggestions(weather, req.body.occasion || 'casual');
          }
        } else {
          styleSuggestions = getWeatherSuggestions(weather, req.body.occasion || 'casual');
        }
      }
    }

    // Sanitize inputs
    const updateData = { weather, updatedAt: Date.now() };
    
    if (req.body.outfitId !== undefined) updateData.outfitId = req.body.outfitId;
    if (req.body.date !== undefined) updateData.date = req.body.date;
    if (req.body.occasion !== undefined) updateData.occasion = req.body.occasion;
    if (req.body.location !== undefined) {
      updateData.location = req.body.location ? stripHtml(limitStringLength(req.body.location.trim(), 100)) : undefined;
    }
    if (req.body.notes !== undefined) {
      updateData.notes = req.body.notes ? stripHtml(limitStringLength(req.body.notes.trim(), 500)) : undefined;
    }

    const event = await CalendarEvent.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate('outfitId');

    if (!event) {
      return res.status(404).json({ 
        message: 'Calendar event not found. It may have been deleted or you don\'t have access to it.' 
      });
    }

    logger.info(`Calendar event updated: ${event._id} by user ${req.user._id}`);
    res.json({
      event,
      styleSuggestions: styleSuggestions.length > 0 ? styleSuggestions : undefined
    });
  } catch (error) {
    logger.error('Error updating calendar event:', error);
    res.status(500).json({ 
      message: 'Unable to update calendar event. Please check your input and try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete calendar event
export const deleteCalendarEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!event) {
      return res.status(404).json({ 
        message: 'Calendar event not found. It may have already been deleted.' 
      });
    }

    logger.info(`Calendar event deleted: ${event._id} by user ${req.user._id}`);
    res.json({ message: 'Outfit removed from calendar successfully' });
  } catch (error) {
    logger.error('Error deleting calendar event:', error);
    res.status(500).json({ 
      message: 'Unable to remove outfit from calendar. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get style suggestions for a date/location
export const getStyleSuggestions = async (req, res) => {
  try {
    const { location, occasion, outfitId } = req.body;

    if (!location) {
      return res.status(400).json({ 
        message: 'Location is required to get weather-based style suggestions.' 
      });
    }

    const weather = await getWeatherByLocation(location);
    if (!weather) {
      // Check if API key is configured
      if (!process.env.WEATHER_API_KEY) {
        logger.error('Weather API key not configured in environment variables');
        return res.status(500).json({ 
          message: 'Weather service is not configured. Please contact support.' 
        });
      }
      
      return res.status(400).json({ 
        message: `Unable to fetch weather data for "${location}". Please try:\n- Adding country code (e.g., "Manila, PH" or "New York, US")\n- Using full city name (e.g., "Manila, Philippines")\n- Checking if the city name is spelled correctly\n\nNote: Weather suggestions are optional and you can still schedule outfits without them.` 
      });
    }

    // If outfitId is provided, get clothing items for better suggestions
    let clothingItems = [];
    if (outfitId) {
      const outfit = await Outfit.findOne({
        _id: outfitId,
        userId: req.user._id
      }).populate('items');
      
      if (outfit && outfit.items) {
        clothingItems = outfit.items;
      }
    }

    const suggestions = getWeatherSuggestions(weather, occasion || 'casual', clothingItems);

    res.json({
      weather,
      suggestions,
      occasion: occasion || 'casual'
    });
  } catch (error) {
    logger.error('Error getting style suggestions:', error);
    res.status(500).json({ 
      message: 'Unable to get style suggestions. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

