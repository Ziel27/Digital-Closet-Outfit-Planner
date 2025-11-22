import multer from 'multer';
import { memoryStorage } from 'multer';

// Configure multer to use memory storage (for Cloudinary)
// Cloudinary needs the file buffer, not disk storage
const storage = memoryStorage();

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase().match(/\.[0-9a-z]+$/i)?.[0] || '');
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit (Cloudinary supports up to 10MB)
  },
  fileFilter: fileFilter
});

export default upload;
