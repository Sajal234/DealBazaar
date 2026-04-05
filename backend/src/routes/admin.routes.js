import express from 'express';
import {
  listActiveDeals,
  listApprovedStores,
  listPendingStores,
  listPendingDeals,
  removeDeal,
  removeStore,
  updateStoreStatus,
  updateDealStatus,
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { adminRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Strict Middleware Boundary:
// Applying `use` here unconditionally enforces that every single route 
// defined below it MUST successfully pass both JWT verification AND 'admin' role checks.
router.use(protect);
router.use(authorize('admin'));
router.use(adminRateLimiter);

// @route   PATCH /api/admin/stores/:id/status
// @desc    Approve/Reject Store (Assigns Trust isVerified flag)
// @access  Private (Admin Only)
router.get('/stores/pending', listPendingStores);
router.get('/stores/approved', listApprovedStores);
router.patch('/stores/:id/status', updateStoreStatus);
router.patch('/stores/:id/remove', removeStore);

// @route   PATCH /api/admin/deals/:id/status
// @desc    Approve/Reject Deal (Sets Expiry TTL & Cloudinary Cron triggers)
// @access  Private (Admin Only)
router.get('/deals/pending', listPendingDeals);
router.get('/deals/active', listActiveDeals);
router.patch('/deals/:id/status', updateDealStatus);
router.patch('/deals/:id/remove', removeDeal);

export default router;
