// Magic byte validation for file uploads
// File signatures (first few bytes) that identify file types

const FILE_SIGNATURES = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF], // JPEG
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF (WebP starts with RIFF)
  ],
};

// Validate file by magic bytes
export const validateFileSignature = (buffer, expectedMimeType) => {
  if (!buffer || buffer.length === 0) {
    return false;
  }

  const signatures = FILE_SIGNATURES[expectedMimeType];
  if (!signatures) {
    // If we don't have a signature for this type, allow it but log warning
    return true;
  }

  // Check if buffer starts with any of the expected signatures
  return signatures.some(signature => {
    if (buffer.length < signature.length) {
      return false;
    }
    
    // Special handling for WebP (RIFF...WEBP)
    if (expectedMimeType === 'image/webp') {
      const hasRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && 
                      buffer[2] === 0x46 && buffer[3] === 0x46;
      if (hasRiff && buffer.length >= 12) {
        // Check for WEBP at offset 8
        const webpSignature = String.fromCharCode(...buffer.slice(8, 12));
        return webpSignature === 'WEBP';
      }
      return false;
    }

    // For other formats, check exact match
    return signature.every((byte, index) => buffer[index] === byte);
  });
};

// Sanitize filename to prevent directory traversal and other attacks
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return 'image';
  }

  // Remove path components
  const basename = filename.split(/[/\\]/).pop();
  
  // Remove dangerous characters
  const sanitized = basename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length

  // Ensure it's not empty
  if (!sanitized || sanitized.length === 0) {
    return 'image';
  }

  return sanitized;
};

// Validate file size
export const validateFileSize = (size, maxSize = 10 * 1024 * 1024) => {
  return size > 0 && size <= maxSize;
};

// Get file extension from MIME type
export const getExtensionFromMimeType = (mimeType) => {
  const mimeToExt = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return mimeToExt[mimeType] || 'jpg';
};

