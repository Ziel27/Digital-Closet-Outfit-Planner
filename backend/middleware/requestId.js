import { randomUUID } from 'crypto';

// Generate unique request ID for tracking
export const requestId = (req, res, next) => {
  const id = randomUUID();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
};

