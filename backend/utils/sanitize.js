// Escape special regex characters to prevent ReDoS
export const escapeRegExp = (string) => {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Sanitize MongoDB query operators
export const sanitizeQuery = (query) => {
  if (!query || typeof query !== 'object') return {};
  
  const sanitized = {};
  const allowedOperators = ['$or', '$and', '$in', '$nin', '$gt', '$gte', '$lt', '$lte', '$ne', '$regex', '$options'];
  
  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith('$') && !allowedOperators.includes(key)) {
      continue; // Skip disallowed operators
    }
    sanitized[key] = value;
  }
  
  return sanitized;
};

// Limit string length to prevent DoS
export const limitStringLength = (str, maxLength = 100) => {
  if (typeof str !== 'string') return '';
  return str.substring(0, maxLength);
};

