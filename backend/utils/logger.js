// Production-optimized logger with sensitive data sanitization and CloudWatch JSON support
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Fields to redact from logs
const SENSITIVE_FIELDS = [
  'token', 'password', 'secret', 'key', 'authorization', 'cookie',
  'csrf', 'session', 'access_token', 'refresh_token',
  'email', 'phone', 'address', 'ssn', 'credit', 'card',
  'api_key', 'apikey', 'private_key', 'oauth', 'client_secret',
  'mongodb', 'database', 'connection_string', 'uri', 'url'
];

// Fields that should never be redacted (even if they contain sensitive keywords)
const SAFE_FIELDS = [
  'statusCode', 'status', 'codeLength', 'hasCode', 'requestId', 'duration',
  'method', 'path', 'ip', 'userAgent', 'userId', 'timestamp', 'level', 'message'
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
      // Check if field is explicitly safe first
      const isSafe = SAFE_FIELDS.some(field => key === field || lowerKey === field.toLowerCase());
      const isSensitive = !isSafe && SENSITIVE_FIELDS.some(field => lowerKey.includes(field));
      
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

// Extract requestId from args if present
const extractRequestId = (args) => {
  if (args.length === 0) return null;
  const firstArg = args[0];
  if (typeof firstArg === 'object' && firstArg !== null && firstArg.requestId) {
    return firstArg.requestId;
  }
  return null;
};

// Format log entry as JSON for CloudWatch or readable format for development
const formatLogEntry = (level, message, requestId = null, ...args) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    ...(requestId && { requestId }),
    ...(args.length > 0 && { 
      data: args.length === 1 ? sanitizeValue(args[0]) : args.map(arg => sanitizeValue(arg))
    })
  };
  
  // In production, output as JSON for CloudWatch Logs Insights
  if (isProduction) {
    return JSON.stringify(logEntry);
  }
  
  // In development, use readable format
  const dataStr = args.length > 0 ? ' ' + JSON.stringify(logEntry.data, null, 2) : '';
  return `[${logEntry.level}] ${logEntry.timestamp} - ${logEntry.message}${requestId ? ` [${requestId}]` : ''}${dataStr}`;
};

const logger = {
  info: (message, ...args) => {
    const requestId = extractRequestId(args);
    const logOutput = formatLogEntry('info', message, requestId, ...args);
    console.log(logOutput);
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
    const requestId = extractRequestId(sanitizedArgs);
    const logOutput = formatLogEntry('error', message, requestId, ...sanitizedArgs);
    console.error(logOutput);
  },
  
  warn: (message, ...args) => {
    const sanitizedArgs = args.map(arg => sanitizeValue(arg));
    const requestId = extractRequestId(sanitizedArgs);
    const logOutput = formatLogEntry('warn', message, requestId, ...sanitizedArgs);
    console.warn(logOutput);
  },
  
  debug: (message, ...args) => {
    if (isDevelopment) {
      const sanitizedArgs = args.map(arg => sanitizeValue(arg));
      const requestId = extractRequestId(sanitizedArgs);
      const logOutput = formatLogEntry('debug', message, requestId, ...sanitizedArgs);
      console.log(logOutput);
    }
  }
};

export default logger;

