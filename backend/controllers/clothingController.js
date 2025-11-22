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

// Get all clothing items for user with pagination
export const getClothing = async (req, res) => {
  try {
    const { category, search, favorite, page, limit } = req.query;
    const { page: pageNum, limit: limitNum, skip } = paginate(page, limit);
    
    const query = { userId: req.user._id };
    
    if (category) query.category = category;
    if (favorite === 'true') query.isFavorite = true;
    if (search) {
      // Sanitize search input - escape regex special characters and limit length
      const sanitizedSearch = escapeRegExp(limitStringLength(search.trim(), 100));
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { brand: { $regex: sanitizedSearch, $options: 'i' } },
        { tags: { $in: [new RegExp(sanitizedSearch, 'i')] } }
      ];
    }
    
    const [clothing, total] = await Promise.all([
      Clothing.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Clothing.countDocuments(query)
    ]);
    
    res.json({
      data: clothing,
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
    logger.error('Error fetching clothing:', error);
    res.status(500).json({ 
      message: 'Unable to retrieve your clothing items. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single clothing item
export const getClothingById = async (req, res) => {
  try {
    const clothing = await Clothing.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!clothing) {
      return res.status(404).json({ 
        message: 'Clothing item not found. It may have been deleted or you don\'t have access to it.' 
      });
    }
    
    res.json(clothing);
  } catch (error) {
    logger.error('Error fetching clothing item:', error);
    res.status(500).json({ 
      message: 'Unable to retrieve clothing item. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create clothing item
export const createClothing = async (req, res) => {
  try {
    // Sanitize and validate inputs
    const sanitizedData = {
      ...req.body,
      name: stripHtml(limitStringLength(req.body.name?.trim() || '', 100)),
      brand: req.body.brand ? stripHtml(limitStringLength(req.body.brand.trim(), 50)) : undefined,
      color: stripHtml(limitStringLength(req.body.color?.trim() || '', 50)),
      size: req.body.size ? stripHtml(limitStringLength(req.body.size.trim(), 20)) : undefined,
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

    const clothing = await Clothing.create(sanitizedData);
    
    logger.info(`Clothing item created: ${clothing._id} by user ${req.user._id}`);
    res.status(201).json(clothing);
  } catch (error) {
    logger.error('Error creating clothing:', error);
    res.status(500).json({ 
      message: 'Unable to create clothing item. Please check your input and try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update clothing item
export const updateClothing = async (req, res) => {
  try {
    // Sanitize and validate inputs
    const updateData = { updatedAt: Date.now() };
    
    if (req.body.name !== undefined) {
      updateData.name = stripHtml(limitStringLength(req.body.name?.trim() || '', 100));
    }
    if (req.body.brand !== undefined) {
      updateData.brand = req.body.brand ? stripHtml(limitStringLength(req.body.brand.trim(), 50)) : undefined;
    }
    if (req.body.color !== undefined) {
      updateData.color = stripHtml(limitStringLength(req.body.color?.trim() || '', 50));
    }
    if (req.body.size !== undefined) {
      updateData.size = req.body.size ? stripHtml(limitStringLength(req.body.size.trim(), 20)) : undefined;
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
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.isFavorite !== undefined) updateData.isFavorite = req.body.isFavorite;
    if (req.body.season !== undefined) updateData.season = req.body.season;
    if (req.body.occasion !== undefined) updateData.occasion = req.body.occasion;

    const clothing = await Clothing.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!clothing) {
      return res.status(404).json({ 
        message: 'Clothing item not found. It may have been deleted or you don\'t have access to it.' 
      });
    }
    
    logger.info(`Clothing item updated: ${clothing._id} by user ${req.user._id}`);
    res.json(clothing);
  } catch (error) {
    logger.error('Error updating clothing:', error);
    res.status(500).json({ 
      message: 'Unable to update clothing item. Please check your input and try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete clothing item
export const deleteClothing = async (req, res) => {
  try {
    const clothing = await Clothing.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!clothing) {
      return res.status(404).json({ 
        message: 'Clothing item not found. It may have already been deleted.' 
      });
    }
    
    logger.info(`Clothing item deleted: ${clothing._id} by user ${req.user._id}`);
    res.json({ message: 'Clothing item deleted successfully' });
  } catch (error) {
    logger.error('Error deleting clothing:', error);
    res.status(500).json({ 
      message: 'Unable to delete clothing item. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Toggle favorite status
export const toggleFavorite = async (req, res) => {
  try {
    const clothing = await Clothing.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      [{ $set: { isFavorite: { $not: '$isFavorite' } } }],
      { new: true }
    );
    
    if (!clothing) {
      return res.status(404).json({ 
        message: 'Clothing item not found.' 
      });
    }
    
    res.json(clothing);
  } catch (error) {
    logger.error('Error toggling favorite:', error);
    res.status(500).json({ 
      message: 'Unable to update favorite status. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

