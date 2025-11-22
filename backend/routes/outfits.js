import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import * as outfitController from '../controllers/outfitController.js';

const router = express.Router();

// Validation middleware
const validateOutfit = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required')
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

// Routes
router.get('/', authenticate, outfitController.getOutfits);
router.get('/:id', authenticate, outfitController.getOutfitById);
router.post('/', authenticate, validateOutfit, handleValidation, outfitController.createOutfit);
router.put('/:id', authenticate, outfitController.updateOutfit);
router.delete('/:id', authenticate, outfitController.deleteOutfit);
router.patch('/:id/favorite', authenticate, outfitController.toggleFavorite);

export default router;

