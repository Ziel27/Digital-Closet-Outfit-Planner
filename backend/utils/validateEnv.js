import logger from './logger.js';

export const validateEnv = () => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'SESSION_SECRET',
    'MONGODB_URI'
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    logger.error('Missing required environment variables:');
    missing.forEach(varName => {
      logger.error(`  - ${varName}`);
    });
    logger.error('Please set these variables in your .env file');
    process.exit(1);
  }

  // Warn about weak defaults in development
  if (process.env.NODE_ENV !== 'production') {
    if (process.env.SESSION_SECRET === 'your-session-secret') {
      logger.warn('⚠️  Using default SESSION_SECRET. Change this in production!');
    }
  }

  logger.info('✓ All required environment variables are set');
};

