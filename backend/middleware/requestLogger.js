import logger from '../utils/logger.js';

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = req.id || 'unknown';
  
  // Log request with request ID
  logger.info(`${req.method} ${req.path}`, {
    requestId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?._id || 'anonymous'
  });
  
  // Log response when finished
  res.on('finish', () => {
    // Skip logging common 404s that browsers/search engines request
    const common404Paths = ['/favicon.ico', '/robots.txt', '/apple-touch-icon.png', '/favicon.png'];
    if (res.statusCode === 404 && common404Paths.includes(req.path)) {
      return; // Don't log these as errors
    }
    
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    
    logger[logLevel](`${req.method} ${req.path} - ${res.statusCode}`, {
      requestId,
      duration: `${duration}ms`,
      statusCode: res.statusCode
    });
  });
  
  next();
};

