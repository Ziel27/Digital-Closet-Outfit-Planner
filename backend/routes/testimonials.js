import express from 'express';
import Testimonial from '../models/Testimonial.js';
import { authenticate } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { stripHtml, limitStringLength } from '../utils/htmlSanitize.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get all approved testimonials (public endpoint)
router.get('/public', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Calculate average rating
    const allTestimonials = await Testimonial.find({ isApproved: true });
    const avgRating = allTestimonials.length > 0
      ? (allTestimonials.reduce((sum, t) => sum + t.rating, 0) / allTestimonials.length).toFixed(1)
      : 0;
    
    res.json({
      testimonials: testimonials.map(t => ({
        name: t.name,
        role: t.role,
        rating: t.rating,
        comment: t.comment,
        avatar: t.userId?.avatar || null
      })),
      averageRating: parseFloat(avgRating),
      totalTestimonials: allTestimonials.length
    });
  } catch (error) {
    logger.error('Error fetching testimonials:', error);
    res.status(500).json({ 
      message: 'Error fetching testimonials', 
      error: error.message,
      testimonials: [],
      averageRating: 0,
      totalTestimonials: 0
    });
  }
});

// Create testimonial (authenticated)
router.post('/',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Sanitize inputs
      const sanitizedData = {
        name: stripHtml(limitStringLength(req.body.name.trim(), 100)),
        role: req.body.role ? stripHtml(limitStringLength(req.body.role.trim(), 50)) : 'User',
        rating: req.body.rating,
        comment: stripHtml(limitStringLength(req.body.comment.trim(), 500)),
        userId: req.user._id
      };

      const testimonial = await Testimonial.create(sanitizedData);

      const populated = await Testimonial.findById(testimonial._id).populate('userId', 'name avatar');
      res.status(201).json(populated);
    } catch (error) {
      logger.error('Error creating testimonial:', error);
      res.status(500).json({ 
        message: 'Error creating testimonial', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

export default router;

