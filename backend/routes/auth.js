import express from 'express';
import passport from 'passport';
import crypto from 'crypto';
import { generateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Store temporary codes (in production, use Redis or database)
const codeStore = new Map();

// Generate secure random code
const generateCode = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Clean up expired codes periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of codeStore.entries()) {
    if (value.expiresAt < now) {
      codeStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

// Google OAuth routes
router.get('/google', (req, res, next) => {
  logger.info('=== GOOGLE OAUTH INITIATED ===');
  logger.info('Request URL:', req.url);
  logger.info('Base URL:', req.baseUrl);
  logger.info('Full URL:', req.protocol + '://' + req.get('host') + req.originalUrl);
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    try {
      const token = generateToken(req.user._id);
      const code = generateCode();
      
      // Store token with code (expires in 5 minutes)
      codeStore.set(code, { token, expiresAt: Date.now() + 5 * 60 * 1000 });
      
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?code=${code}`);
    } catch (error) {
      logger.error('Error in OAuth callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

// Exchange code for token
router.post('/exchange-code', (req, res) => {
  try {
    logger.info('Exchange code request received', {
      hasCode: !!req.body?.code,
      codeLength: req.body?.code?.length,
    });
    
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      logger.warn('Exchange code failed: Code is missing or invalid');
      return res.status(400).json({ message: 'Code is required' });
    }
    
    const stored = codeStore.get(code);
    
    if (!stored) {
      logger.warn('Exchange code failed: Code not found in store', { 
        storeSize: codeStore.size,
      });
      // Check if code was already used (deleted from store)
      // This can happen with React StrictMode double execution
      return res.status(400).json({ 
        message: 'Invalid or expired code',
        hint: 'This code may have already been used. If you are already logged in, please refresh the page.'
      });
    }
    
    if (stored.expiresAt < Date.now()) {
      codeStore.delete(code);
      logger.warn('Exchange code failed: Code expired', { 
        expiredAt: new Date(stored.expiresAt).toISOString(),
        now: new Date().toISOString(),
      });
      return res.status(400).json({ message: 'Invalid or expired code' });
    }
    
    // Delete code immediately to prevent reuse
    const token = stored.token;
    codeStore.delete(code);
    logger.info('Code exchanged successfully');
    res.json({ token });
  } catch (error) {
    logger.error('Error exchanging code', error);
    res.status(500).json({ message: 'Error exchanging code' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed', error: err.message });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

export default router;

