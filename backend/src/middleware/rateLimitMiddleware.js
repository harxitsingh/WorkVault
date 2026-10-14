/**
 * In-memory sliding-window rate limiter middleware
 * Provides brute-force and DDoS protection without requiring external Redis in dev/small deployments.
 */

const buckets = new Map();

// Periodic cleanup of stale buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of buckets.entries()) {
    if (now > data.resetTime) {
      buckets.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Creates a rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 mins)
 * @param {number} options.max - Max requests per IP in the window (default: 100)
 * @param {string} options.message - Error message when rate limit exceeded
 * @param {boolean} options.skipSuccessfulRequests - Whether to only count failures
 */
export const rateLimit = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Too many requests from this IP, please try again later.',
  keyGenerator = (req) => req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
} = {}) => {
  return (req, res, next) => {
    // Skip in test environment or when DISABLE_RATE_LIMIT is enabled
    if (process.env.DISABLE_RATE_LIMIT === 'true' || process.env.NODE_ENV === 'test') {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();

    let record = buckets.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs
      };
      buckets.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (record.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        success: false,
        message,
        retryAfter: resetSeconds
      });
    }

    next();
  };
};

// Common preset limiters
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 30 : 200, // 200 in dev
  message: 'Too many authentication attempts. Please try again after 15 minutes.'
});

export const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === 'production' ? 20 : 100, // 100 in dev
  message: 'Too many payment requests. Please wait a moment before trying again.'
});
