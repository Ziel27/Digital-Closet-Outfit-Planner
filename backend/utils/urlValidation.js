// URL validation and sanitization utilities

// Validate URL format and security
export const validateUrl = (url, allowedProtocols = ['http:', 'https:']) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  try {
    const urlObj = new URL(url);
    
    // Check protocol
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }

    // Check for dangerous patterns
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      return { valid: false, error: 'Localhost URLs are not allowed' };
    }

    // Check for private IP ranges
    const privateIpPatterns = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
    ];
    
    if (privateIpPatterns.some(pattern => pattern.test(urlObj.hostname))) {
      return { valid: false, error: 'Private IP addresses are not allowed' };
    }

    return { valid: true, url: urlObj.href };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

// Sanitize URL to prevent XSS and other attacks
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove javascript: and data: protocols
  const sanitized = url
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();

  return sanitized;
};

