// Production-safe logger for frontend
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Fields to redact from logs
const SENSITIVE_FIELDS = [
  'token', 'password', 'secret', 'key', 'authorization', 'cookie',
  'csrf', 'session', 'code', 'access_token', 'refresh_token',
  'email', 'phone', 'address', 'ssn', 'credit', 'card',
  'api_key', 'apikey', 'private_key', 'oauth'
];

// Redact sensitive values from objects
const sanitizeValue = (value, depth = 0) => {
  if (depth > 5) return '[Max Depth Reached]'; // Prevent infinite recursion
  
  if (value === null || value === undefined) return value;
  
  if (typeof value === 'string') {
    // Redact if looks like token/JWT (long alphanumeric strings)
    if (value.length > 32 && /^[A-Za-z0-9\-_]+$/.test(value)) {
      return '[REDACTED]';
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
      } else if (typeof val === 'string' && val.length > 100) {
        // Truncate very long strings
        sanitized[key] = val.substring(0, 100) + '... [truncated]';
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  }
  
  return value;
};

// Sanitize error objects
const sanitizeError = (error) => {
  if (!error) return error;
  
  const sanitized = {
    name: error.name,
    message: error.message,
    code: error.code,
    status: error.response?.status,
    statusText: error.response?.statusText,
  };
  
  // Only include safe response data
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') {
      sanitized.responseData = data.length > 200 ? data.substring(0, 200) + '...' : data;
    } else if (typeof data === 'object') {
      sanitized.responseData = sanitizeValue(data);
    }
  }
  
  // Don't include request config (contains headers, tokens, etc.)
  // Don't include full error stack in production
  
  return sanitized;
};

const logger = {
  info: (message, ...args) => {
    if (isProduction) {
      // In production, only log safe messages
      console.log(`[INFO] ${message}`);
    } else {
      console.log(`[INFO] ${message}`, ...args.map(arg => sanitizeValue(arg)));
    }
  },
  
  error: (message, error, ...args) => {
    if (isProduction) {
      // In production, only log sanitized error info
      const sanitized = error ? sanitizeError(error) : {};
      console.error(`[ERROR] ${message}`, sanitized);
    } else {
      // In development, log more details but still sanitized
      const sanitizedError = error ? sanitizeError(error) : null;
      console.error(`[ERROR] ${message}`, sanitizedError, ...args.map(arg => sanitizeValue(arg)));
    }
  },
  
  warn: (message, ...args) => {
    if (isProduction) {
      // Remove sensitive details from warnings
      const safeMessage = message.replace(/token|csrf|session/gi, '[REDACTED]');
      console.warn(`[WARN] ${safeMessage}`);
    } else {
      console.warn(`[WARN] ${message}`, ...args.map(arg => sanitizeValue(arg)));
    }
  },
  
  debug: (message, ...args) => {
    // Only in development
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args.map(arg => sanitizeValue(arg)));
    }
  }
};

export default logger;

