// Production-optimized logger with sensitive data sanitization
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Fields to redact from logs
const SENSITIVE_FIELDS = [
  'token', 'password', 'secret', 'key', 'authorization', 'cookie',
  'csrf', 'session', 'code', 'access_token', 'refresh_token',
  'email', 'phone', 'address', 'ssn', 'credit', 'card',
  'api_key', 'apikey', 'private_key', 'oauth', 'client_secret',
  'mongodb', 'database', 'connection_string', 'uri', 'url'
];

// Redact sensitive values
const sanitizeValue = (value, depth = 0) => {
  if (depth > 5) return '[Max Depth]';
  if (value === null || value === undefined) return value;
  
  if (typeof value === 'string') {
    // Redact long tokens/keys
    if (value.length > 32 && /^[A-Za-z0-9\-_\.]+$/.test(value)) {
      return '[REDACTED]';
    }
    // Redact URLs with credentials
    if (value.includes('://') && (value.includes('@') || value.includes('password'))) {
      return '[REDACTED_URL]';
    }
    return value;
  }
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(item => sanitizeValue(item, depth + 1));
    }
    
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some(field => lowerKey.includes(field));
      
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (val && typeof val === 'object') {
        sanitized[key] = sanitizeValue(val, depth + 1);
      } else if (typeof val === 'string' && val.length > 200) {
        sanitized[key] = val.substring(0, 200) + '... [truncated]';
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }
  
  return value;
};

const logger = {
  info: (message, ...args) => {
    const sanitizedArgs = args.map(arg => sanitizeValue(arg));
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...sanitizedArgs);
  },
  
  error: (message, ...args) => {
    const sanitizedArgs = args.map(arg => {
      if (arg instanceof Error) {
        // In production, don't log full stack traces
        if (isProduction) {
          return {
            name: arg.name,
            message: arg.message,
            ...sanitizeValue(arg)
          };
        }
        return arg;
      }
      return sanitizeValue(arg);
    });
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...sanitizedArgs);
  },
  
  warn: (message, ...args) => {
    const sanitizedArgs = args.map(arg => sanitizeValue(arg));
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...sanitizedArgs);
  },
  
  debug: (message, ...args) => {
    if (isDevelopment) {
      const sanitizedArgs = args.map(arg => sanitizeValue(arg));
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...sanitizedArgs);
    }
  }
};

export default logger;

