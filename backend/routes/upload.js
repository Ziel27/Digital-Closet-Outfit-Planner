import express from 'express';
import { authenticate } from '../middleware/auth.js';
import upload from '../config/upload.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';
import logger from '../utils/logger.js';
import { validateFileSignature, sanitizeFilename } from '../utils/fileValidation.js';

const router = express.Router();

// Helper function to convert buffer to stream
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// Upload single image to Cloudinary
router.post('/clothing', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate file signature (magic bytes) to prevent file type spoofing
    const isValidSignature = validateFileSignature(req.file.buffer, req.file.mimetype);
    if (!isValidSignature) {
      logger.warn(`Invalid file signature detected. MIME type: ${req.file.mimetype}, Filename: ${req.file.originalname}`);
      return res.status(400).json({ 
        message: 'Invalid file type. File content does not match the declared file type.' 
      });
    }

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(req.file.originalname);

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ 
        message: 'Cloudinary not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file' 
      });
    }

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'digital-closet/clothing',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' }, // Resize for optimization
          { quality: 'auto' }, // Auto quality optimization
        ],
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          return res.status(500).json({ 
            message: 'Error uploading to Cloudinary', 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }

        res.json({
          message: 'File uploaded successfully',
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
        });
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    bufferToStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Error uploading file', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete image from Cloudinary
router.delete('/clothing/:publicId', authenticate, async (req, res) => {
  try {
    const publicId = req.params.publicId;
    
    // Extract public_id from full path if needed
    const cloudinaryPublicId = publicId.includes('/') 
      ? publicId.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
      : `digital-closet/clothing/${publicId}`;

    const result = await cloudinary.uploader.destroy(cloudinaryPublicId);
    
    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    logger.error('Delete error:', error);
    res.status(500).json({ 
      message: 'Error deleting image', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
