// Simple logger utility to replace console.log
const isDevelopment = process.env.NODE_ENV === 'development';

const logger = {
  info: (message, ...args) => {
    // Always log info messages, not just in development
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  },
  
  error: (message, ...args) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  },
  
  warn: (message, ...args) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  },
  
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
};

export default logger;

