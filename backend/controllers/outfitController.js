import Outfit from '../models/Outfit.js';
import Clothing from '../models/Clothing.js';
import logger from '../utils/logger.js';
import { escapeRegExp, limitStringLength } from '../utils/sanitize.js';
import { validateUrl, sanitizeUrl } from '../utils/urlValidation.js';
import { stripHtml } from '../utils/htmlSanitize.js';

// Helper function for pagination
const paginate = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20)); // Max 100 items per page
  const skip = (pageNum - 1) * limitNum;
  
  return { page: pageNum, limit: limitNum, skip };
};

// Get all outfits for user with pagination
export const getOutfits = async (req, res) => {
  try {
    const { occasion, season, favorite, search, page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);
    
    const query = { userId: req.user._id };
    
    if (occasion) query.occasion = { $in: [occasion] };
    if (season) query.season = { $in: [season] };
    if (favorite === 'true') query.isFavorite = true;
    if (search) {
      // Sanitize search input - escape regex special characters and limit length
      const sanitizedSearch = escapeRegExp(limitStringLength(search.trim(), 100));
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
        { tags: { $in: [new RegExp(sanitizedSearch, 'i')] } }
      ];
    }
    
    const [outfits, total] = await Promise.all([
      Outfit.find(query)
        .populate('items')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Outfit.countDocuments(query)
    ]);
    
    res.json({
      data: outfits,
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
    logger.error('Error fetching outfits:', error);
    res.status(500).json({ 
      message: 'Unable to retrieve your outfits. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single outfit
export const getOutfitById = async (req, res) => {
  try {
    const outfit = await Outfit.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('items');
    
    if (!outfit) {
      return res.status(404).json({ 
        message: 'Outfit not found. It may have been deleted or you don\'t have access to it.' 
      });
    }
    
    res.json(outfit);
  } catch (error) {
    logger.error('Error fetching outfit:', error);
    res.status(500).json({ 
      message: 'Unable to retrieve outfit. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create outfit
export const createOutfit = async (req, res) => {
  try {
    // Verify all items belong to the user
    const items = await Clothing.find({
      _id: { $in: req.body.items },
      userId: req.user._id
    });
    
    if (items.length !== req.body.items.length) {
      return res.status(400).json({ 
        message: 'Some clothing items were not found or don\'t belong to you. Please select valid items from your closet.' 
      });
    }

    // Sanitize and validate inputs
    const sanitizedData = {
      name: stripHtml(limitStringLength(req.body.name?.trim() || '', 100)),
      description: req.body.description ? stripHtml(limitStringLength(req.body.description.trim(), 500)) : undefined,
      items: req.body.items,
      tags: Array.isArray(req.body.tags) 
        ? req.body.tags.map(tag => stripHtml(limitStringLength(tag.trim(), 30))).filter(Boolean).slice(0, 10)
        : [],
      userId: req.user._id
    };

    // Validate image URL if provided
    if (req.body.image) {
      const urlValidation = validateUrl(req.body.image);
      if (!urlValidation.valid) {
        return res.status(400).json({ 
          message: urlValidation.error || 'Invalid image URL' 
        });
      }
      sanitizedData.image = urlValidation.url;
    }

    // Copy other safe fields
    if (req.body.season !== undefined) sanitizedData.season = req.body.season;
    if (req.body.occasion !== undefined) sanitizedData.occasion = req.body.occasion;
    if (req.body.rating !== undefined) sanitizedData.rating = req.body.rating;
    if (req.body.isFavorite !== undefined) sanitizedData.isFavorite = req.body.isFavorite;
    
    const outfit = await Outfit.create(sanitizedData);
    
    const populatedOutfit = await Outfit.findById(outfit._id).populate('items');
    logger.info(`Outfit created: ${outfit._id} by user ${req.user._id}`);
    res.status(201).json(populatedOutfit);
  } catch (error) {
    logger.error('Error creating outfit:', error);
    res.status(500).json({ 
      message: 'Unable to create outfit. Please check your input and try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update outfit
export const updateOutfit = async (req, res) => {
  try {
    // If items are being updated, verify they belong to the user
    if (req.body.items) {
      const items = await Clothing.find({
        _id: { $in: req.body.items },
        userId: req.user._id
      });
      
      if (items.length !== req.body.items.length) {
        return res.status(400).json({ 
          message: 'Some clothing items were not found or don\'t belong to you. Please select valid items from your closet.' 
        });
      }
    }

    // Sanitize and validate inputs
    const updateData = { updatedAt: Date.now() };
    
    if (req.body.name !== undefined) {
      updateData.name = stripHtml(limitStringLength(req.body.name?.trim() || '', 100));
    }
    if (req.body.description !== undefined) {
      updateData.description = req.body.description ? stripHtml(limitStringLength(req.body.description.trim(), 500)) : undefined;
    }
    if (req.body.tags !== undefined) {
      updateData.tags = Array.isArray(req.body.tags) 
        ? req.body.tags.map(tag => stripHtml(limitStringLength(tag.trim(), 30))).filter(Boolean).slice(0, 10)
        : [];
    }
    if (req.body.image !== undefined) {
      const urlValidation = validateUrl(req.body.image);
      if (!urlValidation.valid) {
        return res.status(400).json({ 
          message: urlValidation.error || 'Invalid image URL' 
        });
      }
      updateData.image = urlValidation.url;
    }
    // Copy other safe fields
    if (req.body.items !== undefined) updateData.items = req.body.items;
    if (req.body.season !== undefined) updateData.season = req.body.season;
    if (req.body.occasion !== undefined) updateData.occasion = req.body.occasion;
    if (req.body.rating !== undefined) updateData.rating = req.body.rating;
    if (req.body.isFavorite !== undefined) updateData.isFavorite = req.body.isFavorite;
    
    const outfit = await Outfit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate('items');
    
    if (!outfit) {
      return res.status(404).json({ 
        message: 'Outfit not found. It may have been deleted or you don\'t have access to it.' 
      });
    }
    
    logger.info(`Outfit updated: ${outfit._id} by user ${req.user._id}`);
    res.json(outfit);
  } catch (error) {
    logger.error('Error updating outfit:', error);
    res.status(500).json({ 
      message: 'Unable to update outfit. Please check your input and try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete outfit
export const deleteOutfit = async (req, res) => {
  try {
    const outfit = await Outfit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!outfit) {
      return res.status(404).json({ 
        message: 'Outfit not found. It may have already been deleted.' 
      });
    }
    
    logger.info(`Outfit deleted: ${outfit._id} by user ${req.user._id}`);
    res.json({ message: 'Outfit deleted successfully' });
  } catch (error) {
    logger.error('Error deleting outfit:', error);
    res.status(500).json({ 
      message: 'Unable to delete outfit. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Toggle favorite status
export const toggleFavorite = async (req, res) => {
  try {
    const outfit = await Outfit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      [{ $set: { isFavorite: { $not: '$isFavorite' } } }],
      { new: true }
    ).populate('items');
    
    if (!outfit) {
      return res.status(404).json({ 
        message: 'Outfit not found.' 
      });
    }
    
    res.json(outfit);
  } catch (error) {
    logger.error('Error toggling favorite:', error);
    res.status(500).json({ 
      message: 'Unable to update favorite status. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

