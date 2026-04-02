import express from 'express';
import { body } from 'express-validator';
import { createDeal, getDeals, getDealById } from '../controllers/deal.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// @route   POST /api/deals
// @desc    Securely create a deal with Cloudinary integrations
// @access  Private (Store Owners Only)
router.post(
  '/',
  protect,                     // 1. Verify standard JWT Authentication
  upload.array('images', 5),   // 2. Explictly trap the payload using your requested Multer array ceiling
  [
    // 3. Stringently validate text fields via express-validator before DB insertion
    body('productName', 'Product name is required').trim().notEmpty(),
    body('description', 'Detailed description is required').trim().notEmpty(),
    body('city').optional().trim().notEmpty(),
    body('price', 'price is required').isFloat({ min: 0 }).withMessage('Price must be a valid positive number')
  ],
  createDeal                   // 4. Pass execution safely to the optimized controller
);

// @route   GET /api/deals
// @desc    Get all active deals with index-supported search filters
// @access  Public
router.get('/', getDeals);

// @route   GET /api/deals/:id
// @desc    Get a single deal strictly returning owner-masked metadata
// @access  Public
router.get('/:id', optionalAuth, getDealById);

export default router;
