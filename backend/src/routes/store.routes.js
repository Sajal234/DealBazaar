import express from 'express';
import { body } from 'express-validator';
import {
  applyForStore,
  getStores,
  getMyStore,
  getStoreById,
  resubmitStoreApplication,
  submitStoreRating,
} from '../controllers/store.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { publicRateLimiter, storeRatingRateLimiter, storeWriteRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// @route   POST /api/stores
// @desc    Apply for store registration
// @access  Private
router.post(
  '/',
  protect, // Authentication strictly required
  storeWriteRateLimiter,
  [
    body('name', 'Store name is strictly required').trim().notEmpty(),
    body('address', 'Physical address is required').trim().notEmpty(),
    body('state', 'State is required').trim().notEmpty(),
    body('city', 'City is required').trim().notEmpty(),
    body('phone', 'A valid contact phone number is required')
      .trim()
      .notEmpty()
      // Basic check before our controller completely strips all non-digits
      .matches(/^[0-9\-\+\s\(\)]+$/)
      .withMessage('Phone contains invalid characters'),
  ],
  applyForStore
);

// @route   GET /api/stores
// @desc    Get all active/approved stores
// @access  Public
router.get('/', publicRateLimiter, getStores);

// @route   GET /api/stores/me
// @desc    Get the authenticated user's store
// @access  Private
router.get('/me', protect, getMyStore);

// @route   PATCH /api/stores/me
// @desc    Update and resubmit a rejected store application
// @access  Private
router.patch(
  '/me',
  protect,
  storeWriteRateLimiter,
  [
    body('name', 'Store name is strictly required').trim().notEmpty(),
    body('address', 'Physical address is required').trim().notEmpty(),
    body('state', 'State is required').trim().notEmpty(),
    body('city', 'City is required').trim().notEmpty(),
    body('phone', 'A valid contact phone number is required')
      .trim()
      .notEmpty()
      .matches(/^[0-9\-\+\s\(\)]+$/)
      .withMessage('Phone contains invalid characters'),
  ],
  resubmitStoreApplication
);

// @route   POST /api/stores/:id/ratings
// @desc    Create or update the authenticated user's rating for a store
// @access  Private
router.post(
  '/:id/ratings',
  protect,
  storeRatingRateLimiter,
  [
    body('rating', 'Rating must be a whole number between 1 and 5')
      .isInt({ min: 1, max: 5 })
      .toInt(),
  ],
  submitStoreRating
);

// @route   GET /api/stores/:id
// @desc    Get single store by ID
// @access  Public
router.get('/:id', publicRateLimiter, optionalAuth, getStoreById);

export default router;
