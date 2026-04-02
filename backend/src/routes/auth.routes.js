import express from 'express';
import { body } from 'express-validator';
import { signup, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// @route   POST /api/auth/signup
router.post(
  '/signup',
  authRateLimiter,
  [
    body('name', 'Name is strictly required').notEmpty().trim(),
    body('email', 'Please include a completely valid email').isEmail().normalizeEmail(),
    body('password', 'Please enter a securely long password (6+ characters)')
      .isLength({ min: 6 })
      .matches(/\d/)
      .withMessage('Password must contain at least one number'),
  ],
  signup
);

// @route   POST /api/auth/login
router.post(
  '/login',
  authRateLimiter,
  [
    body('email', 'Please include a strictly valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').notEmpty()
  ],
  login
);

// @route   GET /api/auth/me
// Requires robust token validation via the 'protect' middleware!
router.get('/me', protect, getMe);

export default router;
