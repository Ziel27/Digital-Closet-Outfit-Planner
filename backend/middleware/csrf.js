import Tokens from 'csrf';
import logger from '../utils/logger.js';

// The default export from csrf is the Tokens constructor itself
const tokens = new Tokens();

// Generate CSRF token
export const generateCsrfToken = (req, res, next) => {
  try {
    // Ensure session exists (it should be created by session middleware)
    if (!req.session) {
      // If no session, skip CSRF token generation
      req.csrfToken = null;
      return next();
    }
    
    const secret = req.session.csrfSecret || tokens.secretSync();
    if (!req.session.csrfSecret) {
      req.session.csrfSecret = secret;
    }
    
    const token = tokens.create(secret);
    req.csrfToken = token;
    res.locals.csrfToken = token;
    next();
  } catch (error) {
    logger.error('Error generating CSRF token:', error);
    // Don't block the request if CSRF token generation fails
    req.csrfToken = null;
    next();
  }
};

// Verify CSRF token
export const verifyCsrfToken = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for OAuth callbacks and public endpoints
  if (
    req.path.startsWith('/api/auth/google') ||
    req.path === '/api/auth/exchange-code' ||
    req.path === '/api/stats/public' ||
    req.path === '/api/testimonials/public' ||
    req.path === '/api/health' ||
    req.path === '/api/test' ||
    req.path === '/api/csrf-token'
  ) {
    return next();
  }

  try {
    const secret = req.session.csrfSecret;
    const token = req.headers['x-csrf-token'] || req.body._csrf;

    if (!secret || !token) {
      return res.status(403).json({ 
        message: 'CSRF token missing. Please refresh the page and try again.' 
      });
    }

    if (!tokens.verify(secret, token)) {
      logger.warn(`CSRF token verification failed for ${req.method} ${req.path} from ${req.ip}`);
      return res.status(403).json({ 
        message: 'Invalid CSRF token. Please refresh the page and try again.' 
      });
    }

    next();
  } catch (error) {
    logger.error('CSRF verification error:', error);
    res.status(403).json({ message: 'CSRF verification failed' });
  }
};

