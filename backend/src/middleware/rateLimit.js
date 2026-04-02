import rateLimit from 'express-rate-limit';

const getRequestIp = (req) => req.ip || req.socket?.remoteAddress || 'unknown';

const getRateLimitKey = (req) => req.user?._id?.toString() || `ip:${getRequestIp(req)}`;

const getAuthRateLimitKey = (req) => {
  const email =
    typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';

  return email ? `email:${email}` : `ip:${getRequestIp(req)}`;
};

const buildRateLimiter = ({ windowMs, max, message, keyGenerator = getRateLimitKey }) =>
  rateLimit({
    windowMs,
    max,
    keyGenerator,
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
  keyGenerator: getAuthRateLimitKey,
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
