// Basic HTML sanitization to prevent XSS
// For production, consider using a library like DOMPurify or sanitize-html

export const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim();

  // Limit length to prevent DoS
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }

  return sanitized;
};

// Strip HTML tags completely
export const stripHtml = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

// Limit string length (moved here for consistency)
export const limitStringLength = (str, maxLength = 100) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.length > maxLength ? str.substring(0, maxLength) : str;
};

