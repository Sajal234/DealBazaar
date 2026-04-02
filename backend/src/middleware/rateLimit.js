import rateLimit from 'express-rate-limit';

const buildRateLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
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
