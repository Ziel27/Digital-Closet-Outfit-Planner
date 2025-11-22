import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import * as clothingController from '../controllers/clothingController.js';

const router = express.Router();

// Validation middleware
const validateClothing = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').isIn(['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessories', 'other']),
  body('color').trim().notEmpty().withMessage('Color is required'),
  body('image').notEmpty().withMessage('Image is required')
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
router.get('/', authenticate, clothingController.getClothing);
router.get('/:id', authenticate, clothingController.getClothingById);
router.post('/', authenticate, validateClothing, handleValidation, clothingController.createClothing);
router.put('/:id', authenticate, clothingController.updateClothing);
router.delete('/:id', authenticate, clothingController.deleteClothing);
router.patch('/:id/favorite', authenticate, clothingController.toggleFavorite);

export default router;

