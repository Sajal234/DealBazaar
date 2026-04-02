import rateLimit from 'express-rate-limit';

const getRateLimitKey = (req) => req.user?._id?.toString() || req.ip || 'unknown';

const buildRateLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    keyGenerator: getRateLimitKey,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

export const authRateLimiter = buildRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please try again later.',
});

export const storeWriteRateLimiter = buildRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many store management requests. Please try again later.',
});

export const dealWriteRateLimiter = buildRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many deal management requests. Please try again later.',
});

export const adminRateLimiter = buildRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Too many admin requests. Please try again later.',
});

export const publicRateLimiter = buildRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests. Please try again later.',
});
